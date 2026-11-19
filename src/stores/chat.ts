import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useMediaStore } from './media'
import { useFriendsStore } from './friends'
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
  deleteMessageForEveryone,
  deleteMessageForMe,
  deleteSystemMessage,
  markChatAsRead,
  markSystemMessageRead,
  sendDirectMessage,
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
  syncUserProfile,
  toggleHideOnline,
  updateOnlineStatus,
} from '@/api/users'
import { getChatId } from '@/utils/userHelpers'
import { playBellSound } from '@/utils/playBellSound'

export type MainChatTab = 'system' | 'chat'
export type ChatListSubTab = 'all' | 'friends'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const mediaStore = useMediaStore()
  const friendsStore = useFriendsStore()

  const currentUserProfile = ref<UserProfile | null>(null)
  const allUsers = ref<UserProfile[]>([])

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
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null

  const canUseStealth = computed(() =>
    Boolean(currentUserProfile.value?.permissions?.canUseStealth),
  )

  const activeRoom = computed(() => {
    if (!activeChatId.value) return null
    return chats.value.find((c) => c.id === activeChatId.value) || null
  })

  const groupChats = computed(() => chats.value.filter((c) => c.isGroup))

  const chatUnreadCount = computed(() => {
    const uid = authStore.user?.uid
    if (!uid) return 0
    const chatsUnread = chats.value.reduce((sum, room) => sum + (room.unreadCount?.[uid] || 0), 0)
    return chatsUnread + friendsStore.incomingRequests.length
  })

  const systemTabUnreadCount = computed(() => {
    const releasesCount = mediaStore.releaseList().length
    const systemUnread = systemMessages.value.filter((m) => !m.isRead).length
    return releasesCount + systemUnread
  })

  const totalUnreadCount = computed(() => {
    if (!authStore.user?.uid) return 0
    return chatUnreadCount.value + systemTabUnreadCount.value
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

    heartbeatTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && authStore.user?.uid) {
        updateOnlineStatus(authStore.user.uid, true)
      }
    }, 60000)

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

    if (profile.permissions.canSeeAllUsers) {
      unsubAllUsers = subscribeAllUsers((users) => {
        allUsers.value = users
      })
    }
  }

  const cleanup = () => {
    if (unsubChats) unsubChats()
    if (unsubMessages) unsubMessages()
    if (unsubSystem) unsubSystem()
    if (unsubAllUsers) unsubAllUsers()
    if (heartbeatTimer) clearInterval(heartbeatTimer)

    unsubChats = null
    unsubMessages = null
    unsubSystem = null
    unsubAllUsers = null
    heartbeatTimer = null

    isOpen.value = false
    isExpanded.value = false
    activeTab.value = 'chat'
    chatSubTab.value = 'friends'
    chats.value = []
    activeMessages.value = []
    systemMessages.value = []
    allUsers.value = []
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
      markChatAsRead(chatId, uid)
    })

    await markChatAsRead(chatId, uid)
  }

  const openDialogWith = async (peerUid: string) => {
    const uid = authStore.user?.uid
    if (!uid) return
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

    if (others.length === 1 && others[0]) {
      await openDialogWith(others[0])
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

  const closeDialog = () => {
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

  const removeMessage = async (messageId: string, forEveryone: boolean) => {
    if (!activeChatId.value || !authStore.user?.uid) return
    if (forEveryone) {
      await deleteMessageForEveryone(activeChatId.value, messageId)
    } else {
      await deleteMessageForMe(activeChatId.value, messageId, authStore.user.uid)
    }
  }

  const clearCurrentChat = async () => {
    if (!activeChatId.value || !authStore.user?.uid) return
    await clearChatHistoryForUser(activeChatId.value, authStore.user.uid)
    activeMessages.value = []
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
    canUseStealth,
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
    openDialogWith,
    openGroupRoom,
    startChatWithSelected,
    closeDialog,
    sendMessage,
    recommendMediaToFriends,
    sendSystemBroadcast,
    setTyping,
    removeMessage,
    clearCurrentChat,
    toggleStealthMode,
    readSystemItem,
    removeSystemItem,
  }
})
