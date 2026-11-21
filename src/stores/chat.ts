import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './auth'
import { useMediaStore, sanitizeForDb } from './media'
import { useFriendsStore } from './friends'
import { MAIN_ACCOUNT_ID } from '@/constants/env'
import type {
  ChatMessage,
  ChatRoom,
  SharedMediaCard,
  SystemNotificationItem,
  UserProfile,
} from '@/types/chat'
import {
  clearChatHistoryForUser,
  createOrOpenGroupChat,
  deleteMessageForMe,
  deleteMessageForEveryone,
  deleteSystemMessage,
  editChatMessage,
  leaveGroupChat,
  markChatAsRead,
  markMessagesAsRead,
  markSystemMessageRead,
  sendDirectMessage,
  sendDirectMessageBulk,
  sendMediaRecommendationBulk,
  sendRoomMessage,
  sendSystemMessageBulk,
  setTypingStatus,
  subscribeChatMessages,
  subscribeSystemMessages,
  subscribeUserChats,
} from '@/api/chat'
import {
  subscribeAllUsers,
  subscribeToUser,
  syncUserProfile,
  toggleHideOnline,
  updateOnlineStatus,
} from '@/api/users'
import {
  loadUserMediaForCinephile,
  saveFeaturedCinephileConfig,
  saveRecommended,
} from '@/api/firebase'
import { getChatId } from '@/utils/userHelpers'
import { playBellSound } from '@/utils/playBellSound'

export type MainChatTab = 'system' | 'chat'
export type ChatListSubTab = 'all' | 'friends'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const mediaStore = useMediaStore()
  const friendsStore = useFriendsStore()

  const currentUserProfile = ref<UserProfile | null>(null)
  const rawAllUsers = ref<UserProfile[]>([])

  const isOpen = ref(false)
  const isExpanded = ref(false)
  const activeTab = ref<MainChatTab>('chat')
  const chatSubTab = ref<ChatListSubTab>('friends')

  const chats = ref<ChatRoom[]>([])
  const activeChatId = ref<string | null>(null)
  const activePeerUid = ref<string | null>(null)
  const activeMessages = ref<ChatMessage[]>([])
  const systemMessages = ref<SystemNotificationItem[]>([])

  let unsubChats: (() => void) | null = null
  let unsubMessages: (() => void) | null = null
  let unsubSystem: (() => void) | null = null
  let unsubAllUsers: (() => void) | null = null
  let unsubCurrentUser: (() => void) | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let visibilityHandler: (() => void) | null = null
  let pageHideHandler: (() => void) | null = null

  const allUsers = computed(() => {
    const myUid = authStore.user?.uid
    if (!myUid) return []
    return rawAllUsers.value.filter(
      (u) => u.uid !== myUid && !u.isDeleted && !u.blockedUsers?.includes(myUid),
    )
  })

  const canSeeAllUsers = computed(() =>
    Boolean(currentUserProfile.value?.permissions?.canSeeAllUsers),
  )

  const canUseStealth = computed(() =>
    Boolean(currentUserProfile.value?.permissions?.canUseStealth),
  )

  const isOwner = computed(() => {
    const me = currentUserProfile.value
    return me?.role === 'owner' || me?.uid === MAIN_ACCOUNT_ID
  })

  const canManageCinephile = computed(
    () => isOwner.value || Boolean(currentUserProfile.value?.permissions?.canManageCinephile),
  )

  const assignFeaturedCinephile = async (target: { uid: string; displayName: string }) => {
    const actor = currentUserProfile.value
    if (!actor || !canManageCinephile.value) return

    const userMedia = await loadUserMediaForCinephile(target.uid)
    let cleanFavorites = userMedia.filter((m) => m.favorite).map(sanitizeForDb)
    let sourceUid = target.uid

    if (!cleanFavorites.length && target.uid !== MAIN_ACCOUNT_ID) {
      const ownerMedia = await loadUserMediaForCinephile(MAIN_ACCOUNT_ID)
      cleanFavorites = ownerMedia.filter((m) => m.favorite).map(sanitizeForDb)
      sourceUid = MAIN_ACCOUNT_ID
    }

    await saveRecommended(cleanFavorites, sourceUid)
    await saveFeaturedCinephileConfig({
      cinephileUid: target.uid,
      cinephileName: target.displayName,
      updatedAt: Date.now(),
      updatedBy: actor.uid,
    })

    mediaStore.recommended = cleanFavorites
    mediaStore.recommendedSourceUid = sourceUid
  }

  const resetCinephileToOwner = async () => {
    if (!canManageCinephile.value || !currentUserProfile.value) return
    await assignFeaturedCinephile({
      uid: currentUserProfile.value.uid,
      displayName: currentUserProfile.value.displayName,
    })
  }
  watch(canSeeAllUsers, (allowed) => {
    if (unsubAllUsers) {
      unsubAllUsers()
      unsubAllUsers = null
    }
    if (allowed && authStore.user) {
      unsubAllUsers = subscribeAllUsers((users) => {
        rawAllUsers.value = users
      })
    } else {
      rawAllUsers.value = []
      if (chatSubTab.value === 'all') {
        chatSubTab.value = 'friends'
      }
    }
  })

  const activeRoom = computed(() => {
    if (!activeChatId.value) return null
    return chats.value.find((c) => c.id === activeChatId.value) || null
  })

  const groupChats = computed(() => chats.value.filter((c) => c.isGroup))

  const chatUnreadCount = computed(() => {
    const uid = authStore.user?.uid
    if (!uid) return 0
    return chats.value.reduce((sum, room) => sum + (room.unreadCount?.[uid] || 0), 0)
  })

  const systemTabUnreadCount = computed(() => {
    const releasesCount = mediaStore.releaseList().length
    const systemUnread = systemMessages.value.filter((m) => !m.isRead).length
    return releasesCount + systemUnread
  })

  const totalUnreadCount = computed(() => {
    if (!authStore.user?.uid) return 0
    return chatUnreadCount.value + systemTabUnreadCount.value + friendsStore.incomingRequests.length
  })

  const init = async () => {
    cleanup()
    const fbUser = authStore.user
    if (!fbUser) {
      currentUserProfile.value = null
      return
    }

    const profile = await syncUserProfile(fbUser)
    if (profile.isDeleted || profile.isBlocked) {
      await authStore.logout()
      return
    }

    if (profile.hideOnline && !profile.permissions?.canUseStealth) {
      await toggleHideOnline(profile.uid, false)
      profile.hideOnline = false
    }

    currentUserProfile.value = profile

    unsubCurrentUser = subscribeToUser(fbUser.uid, (updatedMe) => {
      if (updatedMe) currentUserProfile.value = updatedMe
    })

    heartbeatTimer = setInterval(() => {
      if (authStore.user?.uid) {
        updateOnlineStatus(authStore.user.uid, true)
      }
    }, 30000)

    visibilityHandler = () => {
      const uid = authStore.user?.uid
      if (!uid) return
      if (document.visibilityState === 'visible') {
        updateOnlineStatus(uid, true)
      }
    }

    pageHideHandler = () => {
      const uid = authStore.user?.uid
      if (uid) updateOnlineStatus(uid, false)
    }

    document.addEventListener('visibilitychange', visibilityHandler)
    window.addEventListener('pagehide', pageHideHandler)

    let firstChatsLoad = true
    unsubChats = subscribeUserChats(fbUser.uid, (rooms) => {
      if (!firstChatsLoad) {
        const prevUnread = chats.value.reduce((s, r) => s + (r.unreadCount?.[fbUser.uid] || 0), 0)
        const nextUnread = rooms.reduce((s, r) => s + (r.unreadCount?.[fbUser.uid] || 0), 0)
        if (nextUnread > prevUnread) playBellSound()
      }
      firstChatsLoad = false
      chats.value = rooms

      rooms.forEach((r) => {
        r.participants.forEach((pid) => {
          if (pid !== fbUser.uid) friendsStore.ensureProfileSubscribed(pid)
        })
      })
    })

    let firstSysLoad = true
    unsubSystem = subscribeSystemMessages(fbUser.uid, (items) => {
      if (!firstSysLoad && items.length > systemMessages.value.length) {
        playBellSound()
      }
      firstSysLoad = false
      systemMessages.value = items
    })
  }

  const cleanup = () => {
    if (unsubChats) unsubChats()
    if (unsubMessages) unsubMessages()
    if (unsubSystem) unsubSystem()
    if (unsubAllUsers) unsubAllUsers()
    if (unsubCurrentUser) unsubCurrentUser()
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
      visibilityHandler = null
    }
    if (pageHideHandler) {
      window.removeEventListener('pagehide', pageHideHandler)
      pageHideHandler = null
    }

    unsubChats = null
    unsubMessages = null
    unsubSystem = null
    unsubAllUsers = null
    unsubCurrentUser = null
    heartbeatTimer = null

    isOpen.value = false
    isExpanded.value = false
    activeTab.value = 'chat'
    chatSubTab.value = 'friends'
    chats.value = []
    activeMessages.value = []
    systemMessages.value = []
    rawAllUsers.value = []
    currentUserProfile.value = null
    activeChatId.value = null
    activePeerUid.value = null
  }
  const subscribeToRoom = async (chatId: string, peerUid: string | null) => {
    const uid = authStore.user?.uid
    if (!uid) return

    activeChatId.value = chatId
    activePeerUid.value = peerUid
    activeTab.value = 'chat'
    isOpen.value = true

    if (unsubMessages) unsubMessages()
    activeMessages.value = []

    unsubMessages = subscribeChatMessages(chatId, (msgs) => {
      const minTime = activeRoom.value?.clearedAt?.[uid] || 0
      activeMessages.value = msgs.filter(
        (m) => !m.deletedFor?.includes(uid) && m.createdAt > minTime,
      )

      const unreadIds = activeMessages.value
        .filter((m) => m.senderId !== uid && !m.readBy?.includes(uid))
        .map((m) => m.id)

      if (unreadIds.length) {
        markMessagesAsRead(chatId, uid, unreadIds)
      }
      markChatAsRead(chatId, uid)
    })

    await markChatAsRead(chatId, uid)
  }

  const openChatWith = async (peerUid: string) => {
    const uid = authStore.user?.uid
    if (!uid) return
    const peer =
      rawAllUsers.value.find((u) => u.uid === peerUid) || friendsStore.profilesMap[peerUid]
    if (peer?.blockedUsers?.includes(uid)) return
    if (currentUserProfile.value?.blockedUsers?.includes(peerUid)) return

    friendsStore.ensureProfileSubscribed(peerUid)
    const chatId = getChatId(uid, peerUid)
    await subscribeToRoom(chatId, peerUid)
  }

  const openGroupRoom = async (chatId: string) => {
    const room = chats.value.find((c) => c.id === chatId)
    room?.participants.forEach((pid) => {
      if (pid !== authStore.user?.uid) friendsStore.ensureProfileSubscribed(pid)
    })
    await subscribeToRoom(chatId, null)
  }

  const startChatWithSelected = async (selectedUids: string[], groupTitle?: string) => {
    const uid = authStore.user?.uid
    if (!uid || !currentUserProfile.value) return
    const others = Array.from(new Set(selectedUids.filter((id) => id !== uid)))
    if (!others.length) return

    const firstOther = others[0]
    if (others.length === 1 && firstOther) {
      await openChatWith(firstOther)
      return
    }

    others.forEach((id) => friendsStore.ensureProfileSubscribed(id))
    const chatId = await createOrOpenGroupChat({
      creator: currentUserProfile.value,
      participantUids: others,
      groupTitle,
    })
    await subscribeToRoom(chatId, null)
  }

  const closeChat = () => {
    if (unsubMessages) {
      unsubMessages()
      unsubMessages = null
    }
    activeChatId.value = null
    activePeerUid.value = null
    activeMessages.value = []
  }

  const sendMessage = async (text: string, mediaCard?: SharedMediaCard) => {
    if (!currentUserProfile.value || !activeChatId.value) return
    if (!text.trim() && !mediaCard) return

    if (activeRoom.value?.isGroup) {
      await sendRoomMessage({
        chatId: activeChatId.value,
        sender: currentUserProfile.value,
        text,
        mediaCard,
      })
    } else if (activePeerUid.value) {
      await sendDirectMessage({
        sender: currentUserProfile.value,
        recipientUid: activePeerUid.value,
        text,
        mediaCard,
      })
    }
  }

  const sendDirectBroadcast = async (recipientUids: string[], text: string) => {
    if (!currentUserProfile.value || !recipientUids.length || !text.trim()) return
    await sendDirectMessageBulk({
      sender: currentUserProfile.value,
      recipientUids,
      text,
    })
  }

  const recommendMediaToFriends = async (
    recipientUids: string[],
    mediaCard: SharedMediaCard,
    comment?: string,
  ) => {
    if (!currentUserProfile.value || !recipientUids.length) return
    await sendMediaRecommendationBulk({
      sender: currentUserProfile.value,
      recipientUids,
      mediaCard,
      comment,
    })
  }

  const sendSystemBroadcast = async (params: {
    recipientUids: string[]
    title: string
    text: string
    isAnonymous: boolean
    mediaCard?: SharedMediaCard
  }) => {
    if (!currentUserProfile.value) return
    await sendSystemMessageBulk({
      sender: currentUserProfile.value,
      ...params,
    })
  }

  const setTyping = async (isTyping: boolean) => {
    if (!activeChatId.value || !authStore.user?.uid) return
    await setTypingStatus(activeChatId.value, authStore.user.uid, isTyping)
  }

  const editMessage = async (messageId: string, newText: string) => {
    if (!activeChatId.value || !authStore.user?.uid) return
    const trimmed = newText.trim()
    if (!trimmed) return
    await editChatMessage(activeChatId.value, messageId, trimmed)
  }

  const removeMessage = async (messageId: string) => {
    if (!activeChatId.value || !authStore.user?.uid) return
    await deleteMessageForMe(activeChatId.value, messageId, authStore.user.uid)
  }

  const removeMessageForEveryone = async (messageId: string) => {
    if (!activeChatId.value || !authStore.user?.uid) return
    await deleteMessageForEveryone(activeChatId.value, messageId)
  }

  const clearCurrentChat = async () => {
    if (!activeChatId.value || !authStore.user?.uid) return
    await clearChatHistoryForUser(activeChatId.value, authStore.user.uid)
    closeChat()
  }

  const leaveCurrentGroupChat = async () => {
    if (!activeChatId.value || !currentUserProfile.value || !activeRoom.value?.isGroup) return
    const targetChatId = activeChatId.value
    closeChat()
    await leaveGroupChat(targetChatId, currentUserProfile.value)
  }

  const toggleStealthMode = async () => {
    if (!currentUserProfile.value || !canUseStealth.value) return
    const nextVal = !currentUserProfile.value.hideOnline
    await toggleHideOnline(currentUserProfile.value.uid, nextVal)
    currentUserProfile.value.hideOnline = nextVal
  }

  const readSystemItem = async (id: string) => {
    if (!authStore.user?.uid) return
    await markSystemMessageRead(authStore.user.uid, id)
  }

  const removeSystemItem = async (id: string) => {
    if (!authStore.user?.uid) return
    await deleteSystemMessage(authStore.user.uid, id)
  }

  return {
    currentUserProfile,
    allUsers,
    canSeeAllUsers,
    canUseStealth,
    isOwner,
    canManageCinephile,
    assignFeaturedCinephile,
    resetCinephileToOwner,
    isOpen,
    isExpanded,
    activeTab,
    chatSubTab,
    chats,
    groupChats,
    activeChatId,
    activePeerUid,
    activeRoom,
    activeMessages,
    systemMessages,
    chatUnreadCount,
    totalUnreadCount,
    systemTabUnreadCount,
    init,
    cleanup,
    openChatWith,
    openGroupRoom,
    startChatWithSelected,
    closeChat,
    sendMessage,
    sendDirectBroadcast,
    recommendMediaToFriends,
    sendSystemBroadcast,
    setTyping,
    editMessage,
    removeMessage,
    removeMessageForEveryone,
    clearCurrentChat,
    leaveCurrentGroupChat,
    toggleStealthMode,
    readSystemItem,
    removeSystemItem,
  }
})
