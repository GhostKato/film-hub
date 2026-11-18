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
  deleteMessageForEveryone,
  deleteMessageForMe,
  deleteSystemMessage,
  markChatAsRead,
  markSystemMessageRead,
  sendDirectMessage,
  sendMediaRecommendationBulk,
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
  const activePeerUid = ref<string | null>(null)
  const activeMessages = ref<ChatMessage[]>([])
  const systemMessages = ref<SystemNotificationItem[]>([])

  let unsubChats: (() => void) | null = null
  let unsubMessages: (() => void) | null = null
  let unsubSystem: (() => void) | null = null
  let unsubAllUsers: (() => void) | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null

  const activeChatId = computed(() => {
    const uid = authStore.user?.uid
    if (!uid || !activePeerUid.value) return null
    return getChatId(uid, activePeerUid.value)
  })

  const activeRoom = computed(() => {
    if (!activeChatId.value) return null
    return chats.value.find((c) => c.id === activeChatId.value) || null
  })

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
        const peer = r.participants.find((id) => id !== fbUser.uid)
        if (peer) friendsStore.ensureProfileSubscribed(peer)
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
    activePeerUid.value = null
  }

  const openDialogWith = async (peerUid: string) => {
    const uid = authStore.user?.uid
    if (!uid) return

    friendsStore.ensureProfileSubscribed(peerUid)
    activePeerUid.value = peerUid
    activeTab.value = 'chat'
    isOpen.value = true

    if (unsubMessages) unsubMessages()
    const chatId = getChatId(uid, peerUid)

    unsubMessages = subscribeChatMessages(chatId, (msgs) => {
      const minTime = activeRoom.value?.clearedAt?.[uid] || 0
      activeMessages.value = msgs.filter(
        (m) => !m.deletedFor?.includes(uid) && m.createdAt > minTime,
      )
      markChatAsRead(chatId, uid)
    })

    await markChatAsRead(chatId, uid)
  }

  const closeDialog = () => {
    if (unsubMessages) {
      unsubMessages()
      unsubMessages = null
    }
    activePeerUid.value = null
    activeMessages.value = []
  }

  const sendMessage = async (text: string, mediaCard?: SharedMediaCard) => {
    if (!currentUserProfile.value || !activePeerUid.value) return
    if (!text.trim() && !mediaCard) return

    await sendDirectMessage({
      sender: currentUserProfile.value,
      recipientUid: activePeerUid.value,
      text,
      mediaCard,
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
    if (!currentUserProfile.value) return
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
    isOpen,
    isExpanded,
    activeTab,
    chatSubTab,
    chats,
    activePeerUid,
    activeChatId,
    activeRoom,
    activeMessages,
    systemMessages,
    chatUnreadCount,
    totalUnreadCount,
    systemTabUnreadCount,
    init,
    cleanup,
    openDialogWith,
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
