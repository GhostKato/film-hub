<template>
  <div class="users-tab-wrap">
    <div class="users-toolbar">
      <input
        v-model="filterQuery"
        type="text"
        class="glass-input"
        :placeholder="$t('chat.filter_users_placeholder')"
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
              selectedUids.length === selectableUsers.length && selectableUsers.length > 0
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
        :disabled="!selectedUids.length || !broadcastText.trim() || isSending"
      >
        {{ $t('chat.send_to_selected', { count: selectedUids.length }) }}
      </button>
    </div>

    <div class="scroll-area">
      <p v-if="!filteredUsers.length" class="hint-text">{{ $t('media_list.not_found') }}</p>

      <UserRowCard
        v-for="user in filteredUsers"
        :key="user.uid"
        :user="user"
        :selection-mode="isBroadcastMode"
        :selected="selectedUids.includes(user.uid)"
        :last-message="getLastMessage(user.uid)"
        :unread-count="getUnreadForUser(user.uid)"
        @toggle-select="toggleUserSelection"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { getChatId } from '@/utils/userHelpers'
import { notificationStore } from '@/stores/notifications'
import UserRowCard from './UserRowCard.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { t } = useI18n()

const filterQuery = ref('')
const isBroadcastMode = ref(false)
const selectedUids = ref<string[]>([])
const broadcastModeType = ref<'direct' | 'system'>('direct')
const broadcastTitle = ref('')
const broadcastText = ref('')
const isAnonymous = ref(true)
const isSending = ref(false)

const canSendSystem = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canSendSystemMessages),
)

const filteredUsers = computed(() => {
  const q = filterQuery.value.trim().toLowerCase()
  return chatStore.allUsers.filter((u) => {
    if (!q) return true
    return u.displayNameLower.includes(q)
  })
})

const selectableUsers = computed(() =>
  filteredUsers.value.filter((u) => !chatStore.currentUserProfile?.blockedUsers?.includes(u.uid)),
)

const enterBroadcastMode = () => {
  isBroadcastMode.value = true
  selectedUids.value = []
  broadcastModeType.value = 'direct'
}

const exitBroadcastMode = () => {
  isBroadcastMode.value = false
  selectedUids.value = []
  broadcastTitle.value = ''
  broadcastText.value = ''
}

const toggleUserSelection = (uid: string) => {
  const idx = selectedUids.value.indexOf(uid)
  if (idx === -1) selectedUids.value.push(uid)
  else selectedUids.value.splice(idx, 1)
}

const toggleSelectAll = () => {
  if (selectedUids.value.length === selectableUsers.value.length) {
    selectedUids.value = []
  } else {
    selectedUids.value = selectableUsers.value.map((u) => u.uid)
  }
}

const submitBroadcast = async () => {
  if (!selectedUids.value.length || !broadcastText.value.trim()) return
  isSending.value = true
  try {
    if (broadcastModeType.value === 'system' && canSendSystem.value) {
      await chatStore.sendSystemBroadcast({
        recipientUids: selectedUids.value,
        title: broadcastTitle.value,
        text: broadcastText.value,
        isAnonymous: isAnonymous.value,
      })
    } else {
      await chatStore.sendDirectBroadcast(selectedUids.value, broadcastText.value)
    }
    notificationStore.success(t('chat.broadcast_sent'))
    exitBroadcastMode()
  } finally {
    isSending.value = false
  }
}

const getUnreadForUser = (targetUid: string) => {
  const myUid = authStore.user?.uid
  if (!myUid) return 0
  const room = chatStore.chats.find((c) => c.id === getChatId(myUid, targetUid))
  return room?.unreadCount?.[myUid] || 0
}

const getLastMessage = (targetUid: string) => {
  const myUid = authStore.user?.uid
  if (!myUid) return ''
  const room = chatStore.chats.find((c) => c.id === getChatId(myUid, targetUid))
  return room?.lastMessage || ''
}
</script>
<style scoped>
.users-tab-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.users-toolbar {
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
  gap: 8px;
}
.hint-text {
  font-size: 13px;
  color: var(--color-light-grey);
  text-align: center;
  padding: 10px;
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
