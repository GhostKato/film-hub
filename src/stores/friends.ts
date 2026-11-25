import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useChatStore } from './chat'
import type { FriendshipItem, UserProfile } from '@/types/chat'
import {
  acceptFriendRequest,
  removeFriendship,
  sendFriendRequest,
  subscribeFriendships,
} from '@/api/friends'
import { searchUsersByNickname, subscribeToUser } from '@/api/users'
import { sortUsersOnlineAlpha } from '@/utils/userHelpers'

export const useFriendsStore = defineStore('friends', () => {
  const authStore = useAuthStore()
  const friendships = ref<FriendshipItem[]>([])
  const profilesMap = ref<Record<string, UserProfile>>({})
  const searchResults = ref<UserProfile[]>([])
  const isSearching = ref(false)
  const presenceTick = ref(Date.now())

  let unsubFriendships: (() => void) | null = null
  let presenceTimer: ReturnType<typeof setInterval> | null = null
  const profileUnsubs = new Map<string, () => void>()

  const ensureProfileSubscribed = (uid: string) => {
    if (profileUnsubs.has(uid)) return
    const unsub = subscribeToUser(uid, (profile) => {
      if (profile) {
        profilesMap.value[uid] = profile
      }
    })
    profileUnsubs.set(uid, unsub)
  }

  const init = () => {
    cleanup()
    const uid = authStore.user?.uid
    if (!uid) return

    presenceTimer = setInterval(() => {
      presenceTick.value = Date.now()
    }, 15000)

    unsubFriendships = subscribeFriendships(uid, (items) => {
      friendships.value = items
      items.forEach((f) => {
        const otherUid = f.users.find((id) => id !== uid)
        if (otherUid) ensureProfileSubscribed(otherUid)
      })
    })
  }

  const cleanup = () => {
    if (unsubFriendships) {
      unsubFriendships()
      unsubFriendships = null
    }
    if (presenceTimer) {
      clearInterval(presenceTimer)
      presenceTimer = null
    }
    profileUnsubs.forEach((u) => u())
    profileUnsubs.clear()
    friendships.value = []
    profilesMap.value = {}
    searchResults.value = []
  }

  const acceptedFriends = computed(() => {
    const uid = authStore.user?.uid
    if (!uid) return []
    const chatStore = useChatStore()

    const list = friendships.value
      .filter((f) => f.status === 'accepted')
      .map((f) => {
        const friendUid = f.users.find((id) => id !== uid)!
        return {
          friendshipId: f.id,
          user: profilesMap.value[friendUid],
          friendUid,
        }
      })
      .filter((item) => item.user && !item.user.isDeleted && !item.user.blockedUsers?.includes(uid))

    const sortedUsers = sortUsersOnlineAlpha(
      list.map((item) => item.user!),
      chatStore.currentUserProfile,
      presenceTick.value,
    )
    const orderMap = new Map(sortedUsers.map((u, idx) => [u.uid, idx]))

    return [...list].sort(
      (a, b) => (orderMap.get(a.friendUid) ?? 0) - (orderMap.get(b.friendUid) ?? 0),
    )
  })

  const incomingRequests = computed(() => {
    const uid = authStore.user?.uid
    if (!uid) return []
    return friendships.value
      .filter((f) => f.status === 'pending' && f.requesterId !== uid)
      .map((f) => ({
        friendshipId: f.id,
        user: profilesMap.value[f.requesterId],
        senderUid: f.requesterId,
      }))
      .filter((item) => !item.user?.blockedUsers?.includes(uid))
  })

  const outgoingRequests = computed(() => {
    const uid = authStore.user?.uid
    if (!uid) return []
    return friendships.value
      .filter((f) => f.status === 'pending' && f.requesterId === uid)
      .map((f) => {
        const targetUid = f.users.find((id) => id !== uid)!
        return {
          friendshipId: f.id,
          user: profilesMap.value[targetUid],
          targetUid,
        }
      })
  })

  const searchByNickname = async (queryText: string) => {
    const uid = authStore.user?.uid
    if (!uid || queryText.trim().length < 3) {
      searchResults.value = []
      return
    }
    isSearching.value = true
    try {
      searchResults.value = await searchUsersByNickname(queryText, uid)
    } finally {
      isSearching.value = false
    }
  }

  const addFriend = async (targetUid: string) => {
    const uid = authStore.user?.uid
    if (!uid) return
    await sendFriendRequest(uid, targetUid)
  }

  const acceptRequest = async (friendshipId: string) => {
    await acceptFriendRequest(friendshipId)
  }

  const declineOrRemove = async (friendshipId: string) => {
    await removeFriendship(friendshipId)
  }

  return {
    friendships,
    profilesMap,
    searchResults,
    isSearching,
    acceptedFriends,
    incomingRequests,
    outgoingRequests,
    init,
    cleanup,
    ensureProfileSubscribed,
    searchByNickname,
    addFriend,
    acceptRequest,
    declineOrRemove,
  }
})
