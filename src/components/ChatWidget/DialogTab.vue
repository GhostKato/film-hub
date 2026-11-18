<template>
  <div class="dialog-tab">
    <div v-if="peerProfile" class="dialog-header">
      <div class="dialog-head-left">
        <button class="back-btn" @click="chatStore.closeDialog()" title="Назад">←</button>
      </div>

      <div class="dialog-head-right">
        <span v-if="isPeerTyping" class="typing-indicator">{{ $t('chat.typing') }}...</span>
        <button
          v-if="chatStore.activeMessages.length"
          class="clear-chat-btn"
          @click="chatStore.clearCurrentChat()"
          :title="$t('chat.clear_history')"
        >
          🧹
        </button>
      </div>
    </div>

    <div ref="messagesBox" class="messages-area">
      <div
        v-for="msg in chatStore.activeMessages"
        :key="msg.id"
        class="msg-bubble"
        :class="{ mine: msg.senderId === authStore.user?.uid }"
      >
        <div class="msg-top">
          <span class="msg-author">{{ msg.senderName }}</span>
          <div class="msg-controls">
            <button
              class="del-btn"
              @click="chatStore.removeMessage(msg.id, false)"
              :title="$t('chat.delete_for_me')"
            >
              🗑
            </button>
            <button
              v-if="canDeleteForAll(msg)"
              class="del-btn all"
              @click="chatStore.removeMessage(msg.id, true)"
              :title="$t('chat.delete_for_all')"
            >
              ✕
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

        <p v-if="msg.text" class="msg-text">{{ msg.text }}</p>
        <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
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

const draft = ref('')
const messagesBox = ref<HTMLElement | null>(null)
let typingTimer: ReturnType<typeof setTimeout> | null = null

const peerProfile = computed(() => {
  if (!chatStore.activePeerUid) return null
  return friendsStore.profilesMap[chatStore.activePeerUid] || null
})

const isPeerTyping = computed(() => {
  if (!chatStore.activePeerUid || !chatStore.activeRoom?.typing) return false
  return Boolean(chatStore.activeRoom.typing[chatStore.activePeerUid])
})

const canDeleteForAll = (msg: ChatMessage) => {
  if (msg.senderId === authStore.user?.uid) return true
  return Boolean(chatStore.currentUserProfile?.permissions.canDeleteAnyMessage)
}

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
  padding: 8px 12px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
}
.dialog-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.back-btn {
  display: none;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  cursor: pointer;
}
.back-btn:hover {
  background-color: var(--glass-hover);
}
@media (max-width: 640px) {
  .back-btn {
    display: inline-flex;
  }
}
.dialog-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.typing-indicator {
  font-size: 12px;
  color: #10b981;
  font-style: italic;
}
.clear-chat-btn {
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  cursor: pointer;
  font-size: 12px;
}
.clear-chat-btn:hover {
  background-color: var(--glass-red);
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
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.msg-bubble.mine {
  align-self: flex-end;
  background-color: var(--glass-red-soft);
  border-color: rgba(255, 61, 0, 0.45);
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
  gap: 4px;
}
.del-btn {
  background: transparent;
  border: none;
  color: var(--color-light-grey);
  font-size: 11px;
  cursor: pointer;
  padding: 0 2px;
}
.del-btn:hover {
  color: var(--color-hover);
}
.media-share-card {
  display: flex;
  gap: 10px;
  padding: 6px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}
.media-share-card:hover {
  border-color: var(--color-hover);
  transform: translateY(-2px);
}
.share-poster {
  width: 48px;
  height: 72px;
  border-radius: 6px;
  object-fit: cover;
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
.input-bar {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.35);
}
.chat-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-white);
  outline: none;
}
.chat-input:focus {
  border-color: var(--color-red);
}
.send-btn {
  width: 38px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-red);
  color: var(--color-white);
  cursor: pointer;
  font-size: 16px;
}
.send-btn:hover:not(:disabled) {
  background-color: var(--glass-hover);
}
.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
