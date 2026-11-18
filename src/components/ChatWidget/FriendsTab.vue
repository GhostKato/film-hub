<template>
  <div class="friends-tab">
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        class="glass-input"
        :placeholder="$t('chat.search_nickname_placeholder')"
        @input="onSearchInput"
      />
    </div>

    <div class="scroll-area">
      <div v-if="searchQuery.trim().length >= 3" class="section-block">
        <p class="section-label">{{ $t('chat.search_results') }}</p>
        <p v-if="friendsStore.isSearching" class="hint-text">...</p>
        <p v-else-if="!friendsStore.searchResults.length" class="hint-text">
          {{ $t('media_list.not_found') }}
        </p>
        <div v-for="user in friendsStore.searchResults" :key="user.uid" class="user-row">
          <UserIdentityBadge :user="user" />
          <button
            v-if="!isAlreadyRelated(user.uid)"
            class="action-btn add"
            @click="friendsStore.addFriend(user.uid)"
          >
            +
          </button>
          <span v-else class="status-tag">✓</span>
        </div>
      </div>

      <div v-if="friendsStore.incomingRequests.length" class="section-block">
        <p class="section-label">{{ $t('chat.incoming_requests') }}</p>
        <div v-for="req in friendsStore.incomingRequests" :key="req.friendshipId" class="user-row">
          <div class="row-actions">
            <button class="action-btn accept" @click="friendsStore.acceptRequest(req.friendshipId)">
              ✔
            </button>
            <button
              class="action-btn decline"
              @click="friendsStore.declineOrRemove(req.friendshipId)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div class="section-block">
        <p class="section-label">
          {{ $t('chat.my_friends') }} ({{ friendsStore.acceptedFriends.length }})
        </p>
        <p v-if="!friendsStore.acceptedFriends.length" class="hint-text">
          {{ $t('chat.no_friends_yet') }}
        </p>

        <div
          v-for="friend in friendsStore.acceptedFriends"
          :key="friend.friendshipId"
          class="user-row clickable"
          :class="{ active: chatStore.activePeerUid === friend.friendUid }"
          @click="chatStore.openDialogWith(friend.friendUid)"
        >
          <div class="friend-info">
            <p v-if="getLastMessage(friend.friendUid)" class="last-msg">
              {{ getLastMessage(friend.friendUid) }}
            </p>
          </div>

          <div class="row-actions">
            <span v-if="getUnreadForFriend(friend.friendUid)" class="unread-pill">
              {{ getUnreadForFriend(friend.friendUid) }}
            </span>
            <button
              class="action-btn decline"
              @click.stop="friendsStore.declineOrRemove(friend.friendshipId)"
              :title="$t('chat.remove_friend')"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFriendsStore } from '@/stores/friends'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { getChatId } from '@/utils/userHelpers'
import UserIdentityBadge from './UserIdentityBadge.vue'

const friendsStore = useFriendsStore()
const chatStore = useChatStore()
const authStore = useAuthStore()

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    friendsStore.searchByNickname(searchQuery.value)
  }, 350)
}

const isAlreadyRelated = (targetUid: string) => {
  return friendsStore.friendships.some((f) => f.users.includes(targetUid))
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
}
.glass-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-white);
  font-size: 13px;
  outline: none;
}
.glass-input:focus {
  border-color: var(--color-red);
}
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-light-grey);
  margin-bottom: 6px;
  text-transform: uppercase;
}
.hint-text {
  font-size: 13px;
  color: var(--color-light-grey);
  text-align: center;
  padding: 8px;
}
.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  margin-bottom: 6px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}
.user-row.clickable {
  cursor: pointer;
}
.user-row.clickable:hover,
.user-row.active {
  border-color: var(--color-hover);
  background-color: rgba(255, 255, 255, 0.1);
}
.friend-info {
  min-width: 0;
  flex: 1;
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
.action-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  cursor: pointer;
  font-weight: bold;
}
.action-btn.add,
.action-btn.accept {
  background-color: var(--glass-green);
}
.action-btn.decline {
  background-color: var(--glass-red-soft);
}
.action-btn.decline:hover {
  background-color: var(--glass-hover);
}
.unread-pill {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
}
</style>
