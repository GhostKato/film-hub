<template>
  <div class="friends-tab">
    <div class="search-box">
      <UserSearchInput v-model="searchQuery" @update:model-value="onSearchInput" />

      <BulkSelectionBar
        :selected-count="selectedFriendUids.length"
        :is-all-selected="isAllSelected"
        :allow-broadcast="false"
        :allow-direct-bulk="true"
        :is-submitting="isCreating"
        @create-group="handleCreateGroupChat"
        @toggle-all="handleToggleSelectButton"
        @clear="selectedFriendUids = []"
        @send-broadcast="handleDirectBroadcast"
      />
    </div>

    <div class="scroll-area">
      <div v-if="searchQuery.trim().length >= 3" class="section-block">
        <p class="section-label">{{ $t('chat.search_results') }}</p>
        <p v-if="friendsStore.isSearching" class="hint-text">...</p>
        <p v-else-if="!friendsStore.searchResults.length" class="hint-text">
          {{ $t('media_list.not_found') }}
        </p>

        <UserCard
          v-for="user in friendsStore.searchResults"
          :key="user.uid"
          :user="user"
          :show-checkbox="false"
          :selected="false"
        />
      </div>

      <div v-if="friendsStore.incomingRequests.length" class="section-block">
        <p class="section-label">{{ $t('chat.incoming_requests') }}</p>

        <div v-for="req in friendsStore.incomingRequests" :key="req.friendshipId" class="user-row">
          <div class="friend-info">
            <UserBadge v-if="req.user" :user="req.user" />
          </div>
          <div class="row-actions">
            <button
              class="action-btn red-mini-btn"
              @click="friendsStore.acceptRequest(req.friendshipId)"
            >
              ✔
            </button>

            <button
              class="action-btn red-mini-btn"
              @click="friendsStore.declineOrRemove(req.friendshipId)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div class="section-block">
        <p v-if="!friendsStore.acceptedFriends.length" class="hint-text">
          {{ $t('chat.no_friends_yet') }}
        </p>

        <UserCard
          v-for="friend in friendsStore.acceptedFriends"
          :key="friend.friendshipId"
          v-show="friend.user"
          :user="friend.user!"
          :selected="selectedFriendUids.includes(friend.friendUid)"
          :last-message="getLastMessage(friend.friendUid)"
          :unread-count="getUnreadForFriend(friend.friendUid)"
          @toggle-select="toggleFriendSelection"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFriendsStore } from '@/stores/friends'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { notificationStore } from '@/stores/notifications'
import { getChatId } from '@/utils/userHelpers'
import UserSearchInput from './UserSearchInput.vue'
import UserBadge from './UserBadge.vue'
import UserCard from './UserCard.vue'
import BulkSelectionBar from './BulkSelectionBar.vue'

const friendsStore = useFriendsStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const { t } = useI18n()

const searchQuery = ref('')
const selectedFriendUids = ref<string[]>([])
const isCreating = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const selectableFriends = computed(() =>
  friendsStore.acceptedFriends.filter(
    (f) => f.user && !chatStore.currentUserProfile?.blockedUsers?.includes(f.friendUid),
  ),
)

const isAllSelected = computed(
  () =>
    selectableFriends.value.length > 0 &&
    selectedFriendUids.value.length === selectableFriends.value.length,
)

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    friendsStore.searchByNickname(searchQuery.value)
  }, 350)
}

const toggleFriendSelection = (uid: string) => {
  const idx = selectedFriendUids.value.indexOf(uid)
  if (idx === -1) selectedFriendUids.value.push(uid)
  else selectedFriendUids.value.splice(idx, 1)
}

const handleToggleSelectButton = () => {
  if (isAllSelected.value) {
    selectedFriendUids.value = []
  } else {
    selectedFriendUids.value = selectableFriends.value.map((f) => f.friendUid)
  }
}

const handleCreateGroupChat = async () => {
  if (selectedFriendUids.value.length < 2) return
  isCreating.value = true
  try {
    await chatStore.startChatWithSelected([...selectedFriendUids.value])
    selectedFriendUids.value = []
  } finally {
    isCreating.value = false
  }
}

const handleDirectBroadcast = async (payload: {
  type: 'direct' | 'system'
  title: string
  text: string
  isAnonymous: boolean
}) => {
  if (selectedFriendUids.value.length < 2 || !payload.text.trim()) return
  isCreating.value = true
  try {
    await chatStore.sendDirectBroadcast([...selectedFriendUids.value], payload.text)
    notificationStore.success(t('chat.friends_broadcast_sent'))
    selectedFriendUids.value = []
  } finally {
    isCreating.value = false
  }
}

const getUnreadForFriend = (friendUid: string) => {
  const myUid = authStore.user?.uid
  if (!myUid) return 0
  const room = chatStore.chats.find((c) => c.id === getChatId(myUid, friendUid))
  return room?.unreadCount?.[myUid] || 0
}

const getLastMessage = (friendUid: string) => {
  const myUid = authStore.user?.uid
  if (!myUid) return ''
  const room = chatStore.chats.find((c) => c.id === getChatId(myUid, friendUid))
  return room?.lastMessage || ''
}
</script>

<style scoped>
.friends-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.search-box {
  padding: 10px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  margin: 0 2px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-light-grey);
}

.hint-text {
  text-align: center;
  font-size: 13px;
  color: var(--color-light-grey);
  padding: 10px;
}

.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  transition: all 0.2s ease;
}

.user-row.clickable {
  cursor: pointer;
}

.user-row.clickable:hover,
.user-row.active {
  border-color: var(--color-hover);
  background-color: rgba(159, 27, 25, 0.16);
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.group-row-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-white);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-msg {
  font-size: 12px;
  color: var(--color-light-grey);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 3px;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.red-mini-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-red-soft);
  color: var(--color-white);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.red-mini-btn:hover {
  background: var(--glass-red);
  border-color: var(--color-hover);
}

.unread-pill {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
}
</style>
