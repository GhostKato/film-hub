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

      <div class="bulk-actions">
        <button
          v-if="!isBroadcastMode"
          class="mini-btn accent full-width"
          @click="enterBroadcastMode"
        >
          📢 {{ $t('chat.group_send_btn') }}
        </button>

        <template v-else>
          <button class="mini-btn" @click="toggleSelectAll">
            {{
              selectedFriendUids.length === selectableFriends.length && selectableFriends.length > 0
                ? $t('chat.unselect_all')
                : $t('chat.select_all')
            }}
          </button>

          <button class="mini-btn danger" @click="exitBroadcastMode">
            ✕ {{ $t('chat.cancel_group_send') }}
          </button>
        </template>
      </div>
    </div>

    <div v-if="isBroadcastMode" class="broadcast-box">
      <div v-if="canSendSystem" class="broadcast-type-row">
        <button
          type="button"
          class="type-pill"
          :class="{ active: broadcastModeType === 'direct' }"
          @click="broadcastModeType = 'direct'"
        >
          💬 {{ $t('chat.broadcast_direct_type') }}
        </button>
        <button
          type="button"
          class="type-pill"
          :class="{ active: broadcastModeType === 'system' }"
          @click="broadcastModeType = 'system'"
        >
          🔔 {{ $t('chat.broadcast_system_type') }}
        </button>
      </div>

      <input
        v-if="broadcastModeType === 'system' && canSendSystem"
        v-model="broadcastTitle"
        type="text"
        class="glass-input"
        :placeholder="$t('chat.broadcast_title_placeholder')"
      />

      <textarea
        v-model="broadcastText"
        rows="2"
        class="glass-input"
        :placeholder="$t('chat.broadcast_text_placeholder')"
      ></textarea>

      <label v-if="broadcastModeType === 'system' && canSendSystem" class="checkbox-row">
        <input type="checkbox" v-model="isAnonymous" />
        <span>{{ $t('chat.send_anonymously') }}</span>
      </label>

      <button
        class="send-broadcast-btn"
        @click="submitBroadcast"
        :disabled="!selectedFriendUids.length || !broadcastText.trim() || isSending"
      >
        {{ $t('chat.send_to_selected', { count: selectedFriendUids.length }) }}
      </button>
    </div>

    <div class="scroll-area">
      <div v-if="searchQuery.trim().length >= 3" class="section-block">
        <p class="section-label">{{ $t('chat.search_results') }}</p>
        <p v-if="friendsStore.isSearching" class="hint-text">...</p>
        <p v-else-if="!friendsStore.searchResults.length" class="hint-text">
          {{ $t('media_list.not_found') }}
        </p>

        <UserRowCard
          v-for="user in friendsStore.searchResults"
          :key="user.uid"
          :user="user"
          :selection-mode="false"
          :selected="false"
        />
      </div>
      <div v-if="friendsStore.incomingRequests.length" class="section-block">
        <p class="section-label">{{ $t('chat.incoming_requests') }}</p>

        <div v-for="req in friendsStore.incomingRequests" :key="req.friendshipId" class="user-row">
          <div class="friend-info"></div>
          <UserIdentityBadge v-if="req.user" :user="req.user" />
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

      <div v-if="chatStore.groupChats.length" class="section-block">
        <p class="section-label">
          {{ $t('chat.group_chats') }} ({{ chatStore.groupChats.length }})
        </p>
        <div
          v-for="room in chatStore.groupChats"
          :key="room.id"
          class="user-row clickable"
          :class="{ active: chatStore.activeChatId === room.id }"
          @click="chatStore.openGroupRoom(room.id)"
        >
          <div class="friend-info">
            <span class="group-row-title">👥 {{ getGroupRoomTitle(room) }}</span>
            <p v-if="room.lastMessage" class="last-msg">{{ room.lastMessage }}</p>
          </div>
          <span v-if="getUnreadForRoom(room.id)" class="unread-pill">
            {{ getUnreadForRoom(room.id) }}
          </span>
        </div>
      </div>

      <div class="section-block">
        <p v-if="!friendsStore.acceptedFriends.length" class="hint-text">
          {{ $t('chat.no_friends_yet') }}
        </p>

        <UserRowCard
          v-for="friend in friendsStore.acceptedFriends"
          :key="friend.friendshipId"
          :user="friend.user!"
          :selection-mode="isBroadcastMode"
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
import { getChatId } from '@/utils/userHelpers'
import { notificationStore } from '@/stores/notifications'
import type { ChatRoom } from '@/types/chat'
import UserIdentityBadge from './UserIdentityBadge.vue'
import UserRowCard from './UserRowCard.vue'

const friendsStore = useFriendsStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const { t } = useI18n()

const searchQuery = ref('')
const isBroadcastMode = ref(false)
const selectedFriendUids = ref<string[]>([])
const broadcastModeType = ref<'direct' | 'system'>('direct')
const broadcastTitle = ref('')
const broadcastText = ref('')
const isAnonymous = ref(true)
const isSending = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const canSendSystem = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canSendSystemMessages),
)

const selectableFriends = computed(() =>
  friendsStore.acceptedFriends.filter(
    (f) => !chatStore.currentUserProfile?.blockedUsers?.includes(f.friendUid),
  ),
)

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    friendsStore.searchByNickname(searchQuery.value)
  }, 350)
}

const enterBroadcastMode = () => {
  isBroadcastMode.value = true
  selectedFriendUids.value = []
  broadcastModeType.value = 'direct'
}

const exitBroadcastMode = () => {
  isBroadcastMode.value = false
  selectedFriendUids.value = []
  broadcastTitle.value = ''
  broadcastText.value = ''
}

const toggleFriendSelection = (uid: string) => {
  const idx = selectedFriendUids.value.indexOf(uid)
  if (idx === -1) selectedFriendUids.value.push(uid)
  else selectedFriendUids.value.splice(idx, 1)
}

const toggleSelectAll = () => {
  if (selectedFriendUids.value.length === selectableFriends.value.length) {
    selectedFriendUids.value = []
  } else {
    selectedFriendUids.value = selectableFriends.value.map((f) => f.friendUid)
  }
}

const submitBroadcast = async () => {
  if (!selectedFriendUids.value.length || !broadcastText.value.trim()) return
  isSending.value = true
  try {
    if (broadcastModeType.value === 'system' && canSendSystem.value) {
      await chatStore.sendSystemBroadcast({
        recipientUids: selectedFriendUids.value,
        title: broadcastTitle.value,
        text: broadcastText.value,
        isAnonymous: isAnonymous.value,
      })
    } else {
      await chatStore.sendDirectBroadcast(selectedFriendUids.value, broadcastText.value)
    }
    notificationStore.success(t('chat.broadcast_sent'))
    exitBroadcastMode()
  } finally {
    isSending.value = false
  }
}

const getGroupRoomTitle = (room: ChatRoom) => {
  if (room.groupTitle) return room.groupTitle
  const names = room.participants
    .filter((uid) => uid !== authStore.user?.uid)
    .map((uid) => friendsStore.profilesMap[uid]?.displayName || '...')
  return names.join(', ') || t('chat.group_chat_default')
}

const getUnreadForRoom = (chatId: string) => {
  const myUid = authStore.user?.uid
  if (!myUid) return 0
  const room = chatStore.chats.find((c) => c.id === chatId)
  return room?.unreadCount?.[myUid] || 0
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
.bulk-actions {
  display: flex;
  justify-content: space-between;
  gap: 6px;
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
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition:
    border-color 0.2s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}
.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}
.glass-input:hover {
  border-color: var(--color-hover);
  background-color: var(--glass-modal);
}
.glass-input:focus {
  border-color: var(--color-red);
  background-color: var(--glass-modal);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.75),
    0 0 12px rgba(159, 27, 25, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
.broadcast-box {
  padding: 10px;
  border-bottom: 1px solid var(--glass-border);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.25) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.broadcast-type-row {
  display: flex;
  gap: 6px;
}
.type-pill {
  flex: 1;
  padding: 5px 6px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-light-grey);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}
.type-pill:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.14);
  color: var(--color-white);
}
.type-pill.active {
  background-color: var(--glass-purple);
  color: var(--color-white);
  border-color: var(--glass-border-bright);
  font-weight: 700;
  box-shadow:
    0 8px 18px rgba(135, 55, 215, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-light-grey);
}
.send-broadcast-btn {
  padding: 7px 10px;
  border-radius: 8px;
  background-color: var(--glass-red);
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  cursor: pointer;
  font-weight: 600;
  box-shadow:
    0 10px 22px rgba(159, 27, 25, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.send-broadcast-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.send-broadcast-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.97);
}
.send-broadcast-btn:disabled {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.35);
  box-shadow: none;
  cursor: not-allowed;
}
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--color-light-grey);
  text-transform: uppercase;
}
.hint-text {
  font-size: 13px;
  color: var(--color-light-grey);
  text-align: center;
  padding: 10px;
}
.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.25s ease,
    background-color 0.25s ease;
}
.user-row.clickable {
  cursor: pointer;
}
.user-row.clickable:hover,
.user-row.active {
  transform: translateY(-2px);
  border-color: var(--glass-border-bright);
  background-color: rgba(255, 255, 255, 0.1);
}
.friend-info {
  min-width: 0;
  flex: 1;
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
.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  cursor: pointer;
  font-weight: bold;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
  transition:
    transform 0.2s ease,
    background-color 0.25s ease;
}
.action-btn:hover {
  transform: translateY(-1px);
  background-color: var(--glass-hover);
}
.action-btn.accept {
  background-color: var(--glass-green);
}
.action-btn.decline {
  background-color: var(--glass-red-soft);
}
.unread-pill {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
.mini-btn {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  font-size: 12px;
  cursor: pointer;
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.mini-btn.full-width {
  width: 100%;
  font-weight: 600;
}
.mini-btn:hover {
  transform: translateY(-2px);
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.mini-btn:active {
  transform: translateY(1px) scale(0.96);
}
.mini-btn.accent {
  background-color: var(--glass-blue);
  box-shadow:
    0 10px 22px rgba(25, 95, 215, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.mini-btn.danger {
  background-color: var(--glass-red-soft);
}
.mini-btn.danger:hover {
  background-color: var(--glass-red);
}
</style>
