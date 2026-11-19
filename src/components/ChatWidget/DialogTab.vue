<template>
  <div class="dialog-tab">
    <div v-if="chatStore.activeChatId" class="dialog-header">
      <div class="dialog-head-left">
        <UserIdentityBadge v-if="peerProfile" :user="peerProfile" />
        <div v-else-if="chatStore.activeRoom?.isGroup" class="group-header-info">
          <span class="group-title">👥 {{ groupTitleText }}</span>
          <span class="group-members-count">
            {{ $t('chat.participants_count', { count: groupMembersList.length }) }}
          </span>
        </div>
      </div>

      <div class="dialog-head-right">
        <span v-if="typingText" class="typing-indicator">{{ typingText }}</span>

        <div class="edit-mode-group">
          <button
            v-if="isEditMode && chatStore.activeMessages.length"
            class="header-action-btn danger-action"
            @click="handleClearChat"
            :title="$t('chat.clear_history')"
          >
            🗑
          </button>

          <button
            class="header-action-btn edit-toggle-btn"
            :class="{ active: isEditMode }"
            @click="toggleEditMode"
            :title="isEditMode ? $t('chat.finish_edit') : $t('chat.edit_chat_mode')"
          >
            {{ isEditMode ? '✔' : '✏️' }}
          </button>
        </div>

        <button
          class="header-action-btn close-dialog-btn"
          @click="handleCloseDialog"
          :title="$t('chat.close_dialog')"
        >
          ✕
        </button>
      </div>
    </div>

    <div ref="messagesBox" class="messages-area">
      <div
        v-for="msg in chatStore.activeMessages"
        :key="msg.id"
        class="msg-bubble"
        :class="{ mine: isMyMessage(msg) }"
      >
        <div class="msg-top">
          <span class="msg-author">{{ msg.senderName }}</span>

          <div v-if="isEditMode && isMyMessage(msg)" class="msg-controls">
            <button
              v-if="msg.text"
              class="del-btn edit"
              @click="startEditingMsg(msg)"
              :title="$t('chat.edit_message')"
            >
              ✏️
            </button>
            <button
              class="del-btn"
              @click="chatStore.removeMessage(msg.id)"
              :title="$t('chat.delete_for_me')"
            >
              🗑
            </button>
          </div>
        </div>

        <div
          v-if="msg.mediaCard"
          class="media-share-card"
          @click="openMedia(msg.mediaCard.media_type, msg.mediaCard.id)"
        >
          <img
            v-if="msg.mediaCard.poster_path"
            :src="getImageUrl(msg.mediaCard.poster_path, 'poster', 'w154')"
            class="share-poster"
            alt="Poster"
          />
          <div class="share-info">
            <span class="share-tag">🎬 {{ $t('chat.recommended_badge') }}</span>
            <h4 class="share-title">{{ msg.mediaCard.title }}</h4>
            <p class="share-meta">
              {{ msg.mediaCard.release_date?.slice(0, 4) }}
              <span v-if="msg.mediaCard.vote_average"> • ⭐ {{ msg.mediaCard.vote_average }}</span>
            </p>
          </div>
        </div>
        <div v-if="editingMessageId === msg.id" class="inline-edit-box">
          <input
            v-model="editingText"
            type="text"
            class="inline-edit-input"
            @keyup.enter="saveEditedMsg(msg.id)"
            @keyup.esc="cancelEditingMsg"
          />
          <div class="inline-edit-actions">
            <button
              type="button"
              class="inline-btn save"
              :disabled="!editingText.trim()"
              @click="saveEditedMsg(msg.id)"
            >
              ✔
            </button>
            <button type="button" class="inline-btn cancel" @click="cancelEditingMsg">✕</button>
          </div>
        </div>

        <p v-else-if="msg.text" class="msg-text">{{ msg.text }}</p>

        <span class="msg-time">
          <span v-if="msg.editedAt" class="edited-label">({{ $t('chat.edited_mark') }}) </span>
          {{ formatTime(msg.createdAt) }}
          <span
            v-if="isMyMessage(msg)"
            class="read-ticks"
            :class="{ read: isMessageReadByOthers(msg) }"
          >
            {{ isMessageReadByOthers(msg) ? '✓✓' : '✓' }}
          </span>
        </span>
      </div>
    </div>

    <form class="input-bar" @submit.prevent="handleSend">
      <input
        v-model="draft"
        type="text"
        class="chat-input"
        :placeholder="$t('chat.message_placeholder')"
        @input="handleTyping"
      />
      <button type="submit" class="send-btn" :disabled="!draft.trim()">➤</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import { getImageUrl } from '@/utils/getImageUrl'
import type { ChatMessage } from '@/types/chat'
import UserIdentityBadge from './UserIdentityBadge.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const router = useRouter()
const { t } = useI18n()

const draft = ref('')
const messagesBox = ref<HTMLElement | null>(null)
const isEditMode = ref(false)
const editingMessageId = ref<string | null>(null)
const editingText = ref('')
let typingTimer: ReturnType<typeof setTimeout> | null = null

const isMyMessage = (msg: ChatMessage) => msg.senderId === authStore.user?.uid

const isMessageReadByOthers = (msg: ChatMessage) => {
  const myUid = authStore.user?.uid
  if (!myUid || !msg.readBy) return false
  return msg.readBy.some((uid) => uid !== myUid)
}
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    cancelEditingMsg()
  }
}

const startEditingMsg = (msg: ChatMessage) => {
  editingMessageId.value = msg.id
  editingText.value = msg.text
}

const cancelEditingMsg = () => {
  editingMessageId.value = null
  editingText.value = ''
}

const saveEditedMsg = async (messageId: string) => {
  const trimmed = editingText.value.trim()
  if (!trimmed) return
  await chatStore.editMessage(messageId, trimmed)
  cancelEditingMsg()
}

const handleClearChat = async () => {
  await chatStore.clearCurrentChat()
  isEditMode.value = false
  cancelEditingMsg()
}

const handleCloseDialog = () => {
  isEditMode.value = false
  cancelEditingMsg()
  chatStore.closeDialog()
}

const peerProfile = computed(() => {
  if (!chatStore.activePeerUid) return null
  return friendsStore.profilesMap[chatStore.activePeerUid] || null
})

const groupMembersList = computed(() => {
  const room = chatStore.activeRoom
  if (!room?.isGroup) return []
  return room.participants
    .filter((uid) => uid !== authStore.user?.uid)
    .map((uid) => friendsStore.profilesMap[uid]?.displayName || '...')
})

const groupTitleText = computed(() => {
  const room = chatStore.activeRoom
  if (room?.groupTitle) return room.groupTitle
  return groupMembersList.value.join(', ') || t('chat.group_chat_default')
})

const typingText = computed(() => {
  const room = chatStore.activeRoom
  const myUid = authStore.user?.uid
  if (!room?.typing || !myUid) return ''
  const typingUids = Object.entries(room.typing)
    .filter(([uid, val]) => uid !== myUid && val)
    .map(([uid]) => friendsStore.profilesMap[uid]?.displayName || '')
    .filter(Boolean)
  if (!typingUids.length) return ''
  if (!room.isGroup) return `${t('chat.typing')}...`
  return `${typingUids.join(', ')} ${t('chat.typing')}...`
})

const handleTyping = () => {
  chatStore.setTyping(true)
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    chatStore.setTyping(false)
  }, 2000)
}

const handleSend = async () => {
  const text = draft.value.trim()
  if (!text) return
  draft.value = ''
  chatStore.setTyping(false)
  await chatStore.sendMessage(text)
}

const openMedia = (type: 'movie' | 'tv', id: number) => {
  chatStore.isOpen = false
  router.push({ name: 'media', params: { type, id } })
}

watch(
  () => chatStore.activeChatId,
  () => {
    isEditMode.value = false
    cancelEditingMsg()
  },
)

watch(
  () => chatStore.activeMessages.length,
  async () => {
    await nextTick()
    if (messagesBox.value) {
      messagesBox.value.scrollTop = messagesBox.value.scrollHeight
    }
  },
  { immediate: true },
)

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
</script>
<style scoped>
.dialog-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.dialog-header {
  position: relative;
  padding: 9px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.42) 0%, rgba(0, 0, 0, 0.16) 100%);
}
.dialog-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 3%;
  width: 94%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--glass-border-bright) 50%,
    transparent 100%
  );
}
.dialog-head-left {
  min-width: 0;
  flex: 1;
}
.group-header-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.group-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.group-members-count {
  font-size: 11px;
  color: var(--color-light-grey);
}
.dialog-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.edit-mode-group {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-right: 8px;
  border-right: 1px solid var(--glass-border);
}
.typing-indicator {
  font-size: 11px;
  color: #34d399;
  font-style: italic;
  text-shadow: 0 0 8px var(--color-shadow-green);
}
.header-action-btn {
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  cursor: pointer;
  font-size: 12px;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.header-action-btn:hover {
  transform: translateY(-1px);
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.header-action-btn:active {
  transform: translateY(1px) scale(0.95);
}
.edit-toggle-btn.active {
  background-color: var(--glass-green);
  border-color: var(--glass-border-bright);
  box-shadow:
    0 8px 18px rgba(16, 155, 95, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.danger-action {
  background-color: var(--glass-red-soft);
}
.danger-action:hover {
  background-color: var(--glass-red);
}
.close-dialog-btn {
  font-weight: 700;
  margin-left: 2px;
}
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.msg-bubble {
  max-width: 82%;
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, var(--glass-bg) 100%);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.msg-bubble.mine {
  align-self: flex-end;
  background: linear-gradient(180deg, rgba(175, 25, 25, 0.42) 0%, var(--glass-red-soft) 100%);
  border-color: rgba(255, 95, 70, 0.45);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.6),
    0 4px 12px rgba(159, 27, 25, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.msg-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.msg-author {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-light-grey);
}
.msg-controls {
  display: flex;
  gap: 6px;
}
.del-btn {
  background: transparent;
  border: none;
  color: var(--color-light-grey);
  font-size: 12px;
  cursor: pointer;
  padding: 0 2px;
  transition: color 0.2s ease;
}
.del-btn:hover {
  color: var(--color-hover);
}
.inline-edit-box {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.inline-edit-input {
  flex: 1;
  min-width: 140px;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid var(--glass-border-bright);
  background-color: rgba(0, 0, 0, 0.5);
  color: var(--color-white);
  font-size: 13px;
  outline: none;
}
.inline-edit-actions {
  display: flex;
  gap: 4px;
}
.inline-btn {
  padding: 4px 7px;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  font-size: 11px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
.inline-btn.save {
  background-color: var(--glass-green);
}
.inline-btn.save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.inline-btn.cancel {
  background-color: var(--glass-red-soft);
}
.media-share-card {
  display: flex;
  gap: 10px;
  padding: 7px;
  border-radius: 10px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition:
    border-color 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease;
}
.media-share-card:hover {
  border-color: var(--glass-border-bright);
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.share-poster {
  width: 48px;
  height: 72px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--glass-border);
}
.share-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}
.share-tag {
  font-size: 10px;
  color: var(--color-hover);
  font-weight: 700;
}
.share-title {
  font-size: 14px;
  margin: 0;
}
.share-meta {
  font-size: 12px;
  color: var(--color-light-grey);
}
.msg-text {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}
.msg-time {
  font-size: 10px;
  color: var(--color-light-grey);
  align-self: flex-end;
}
.read-ticks {
  margin-left: 4px;
  font-weight: 700;
  letter-spacing: -1px;
  color: rgba(255, 255, 255, 0.55);
}
.read-ticks.read {
  color: #60a5fa;
  text-shadow: 0 0 8px var(--color-shadow-blue);
}
.edited-label {
  opacity: 0.75;
  font-style: italic;
}
.input-bar {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid var(--glass-border);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.52) 100%);
}
.chat-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-white);
  outline: none;
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition:
    border-color 0.2s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}
.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}
.chat-input:hover {
  border-color: var(--color-hover);
  background-color: var(--glass-modal);
}
.chat-input:focus {
  border-color: var(--color-red);
  background-color: var(--glass-modal);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.75),
    0 0 12px rgba(159, 27, 25, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
.send-btn {
  width: 40px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-red);
  color: var(--color-white);
  cursor: pointer;
  font-size: 16px;
  box-shadow:
    0 8px 18px rgba(159, 27, 25, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.send-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.95);
}
.send-btn:disabled {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.35);
  box-shadow: none;
  cursor: not-allowed;
}
</style>
