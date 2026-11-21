<template>
  <div class="system-notifications-tab">
    <div class="system-header">
      <span class="system-title">🔔 {{ $t('chat.tab_system') }}</span>

      <button type="button" class="red-chat-btn close-system-btn" @click="$emit('close')">
        {{ $t('chat.close_chat') }}
      </button>
    </div>

    <div class="scroll-area">
      <div v-if="releaseList.length" class="block">
        <div class="block-head">
          <span class="block-title">🎬 {{ $t('modal_release.title') }}</span>
          <button class="clear-btn" @click="mediaStore.removeAllRelease()">
            {{ $t('modal_release.clear_all') }}
          </button>
        </div>

        <div
          v-for="item in releaseList"
          :key="`${item.media_type}_${item.id}`"
          class="sys-card clickable"
          @click="openMedia(item.media_type === 'tv' ? 'tv' : 'movie', item.id)"
        >
          <img
            v-if="item.poster_path"
            :src="getImageUrl(item.poster_path, 'poster', 'w92')"
            class="mini-poster"
            alt="Poster"
          />
          <div class="card-body">
            <h4>{{ item.title || item.name }}</h4>
            <p class="sub">{{ $t('chat.released_today') }}</p>
          </div>
          <button class="close-mini" @click.stop="mediaStore.removeRelease(item)">✕</button>
        </div>
      </div>

      <div v-if="chatStore.systemMessages.length" class="block">
        <p class="block-title">🔔 {{ $t('chat.system_notices') }}</p>
        <div
          v-for="msg in chatStore.systemMessages"
          :key="msg.id"
          class="sys-card"
          :class="{ unread: !msg.isRead }"
          @click="!msg.isRead && chatStore.readSystemItem(msg.id)"
        >
          <div class="card-body">
            <div class="sys-meta">
              <span class="sender-tag">
                {{ msg.isAnonymous ? `🛡️ ${$t('chat.system_sender')}` : msg.senderName }}
              </span>
              <span class="time">{{ formatTime(msg.createdAt) }}</span>
            </div>
            <h4 v-if="msg.title">{{ msg.title }}</h4>
            <p class="msg-text">{{ msg.text }}</p>

            <div
              v-if="msg.mediaCard"
              class="attached-media"
              @click.stop="openMedia(msg.mediaCard.media_type, msg.mediaCard.id)"
            >
              <img
                v-if="msg.mediaCard.poster_path"
                :src="getImageUrl(msg.mediaCard.poster_path, 'poster', 'w92')"
                class="mini-poster"
                alt="Poster"
              />
              <div>
                <strong>{{ msg.mediaCard.title }}</strong>
                <p class="sub">{{ $t('chat.click_to_open_media') }}</p>
              </div>
            </div>
          </div>

          <button class="close-mini" @click.stop="chatStore.removeSystemItem(msg.id)">✕</button>
        </div>
      </div>

      <p v-if="!releaseList.length && !chatStore.systemMessages.length" class="empty-text">
        {{ $t('notification_message.release_empty_info') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from '@/stores/media'
import { useChatStore } from '@/stores/chat'
import { getImageUrl } from '@/utils/getImageUrl'

defineEmits<{
  (e: 'close'): void
}>()

const mediaStore = useMediaStore()
const chatStore = useChatStore()
const router = useRouter()

const releaseList = computed(() => mediaStore.releaseList())

const openMedia = (type: 'movie' | 'tv', id: number) => {
  chatStore.isOpen = false
  router.push({ name: 'media', params: { type, id } })
}

const formatTime = (ts: number) =>
  new Date(ts).toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<style scoped>
.system-notifications-tab {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.system-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg-light);
}

.system-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-white);
}

.red-chat-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-red-soft);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition:
    transform 0.15s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.red-chat-btn:hover {
  background-color: var(--glass-red);
  border-color: var(--glass-border-bright);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.red-chat-btn:active {
  transform: translateY(1px) scale(0.96);
  box-shadow: none;
  transition-duration: 0.08s;
}

.close-system-btn {
  white-space: nowrap;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.block-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-light-grey);
  margin-bottom: 8px;
}

.block-head .block-title {
  margin-bottom: 0;
}

.clear-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: 8px;
  background-color: var(--glass-red);
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition:
    transform 0.15s ease,
    background-color 0.25s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.clear-btn:hover {
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}

.clear-btn:active {
  transform: translateY(1px) scale(0.96);
  box-shadow: none;
  transition-duration: 0.08s;
}

.sys-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
  margin-bottom: 8px;
  position: relative;
  transition:
    transform 0.15s ease,
    border-color 0.25s ease,
    box-shadow 0.2s ease;
}

.sys-card.clickable {
  cursor: pointer;
}

.sys-card.clickable:hover {
  border-color: var(--glass-border-bright);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.sys-card.clickable:active {
  transform: translateY(1px) scale(0.99);
  box-shadow: none;
  transition-duration: 0.08s;
}

.sys-card.unread {
  border-color: var(--color-hover);
  box-shadow:
    0 0 12px rgba(255, 61, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.mini-poster {
  width: 44px;
  height: 66px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.sys-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-light-grey);
  margin-bottom: 4px;
}

.msg-text {
  font-size: 13px;
  margin-top: 4px;
  line-height: 1.4;
}

.sub {
  font-size: 12px;
  color: var(--color-light-grey);
  margin-top: 3px;
}

.attached-media {
  margin-top: 8px;
  padding: 7px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid var(--glass-border);
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  transition:
    border-color 0.25s ease,
    transform 0.15s ease;
}

.attached-media:hover {
  border-color: var(--color-hover);
}

.attached-media:active {
  transform: translateY(1px) scale(0.98);
}

.close-mini {
  background: transparent;
  border: none;
  color: var(--color-light-grey);
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-mini:hover {
  color: var(--color-hover);
}

.empty-text {
  text-align: center;
  color: var(--color-light-grey);
  margin-top: 40px;
  font-size: 14px;
}
</style>
