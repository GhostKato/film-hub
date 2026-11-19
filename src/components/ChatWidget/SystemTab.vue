<template>
  <div class="system-tab">
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
.system-tab {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  box-shadow:
    0 6px 14px rgba(159, 27, 25, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  transition:
    transform 0.2s ease,
    background-color 0.25s ease;
}
.clear-btn:hover {
  transform: translateY(-1px);
  background-color: var(--glass-hover);
}
.sys-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin-bottom: 8px;
  position: relative;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.sys-card.clickable {
  cursor: pointer;
}
.sys-card.clickable:hover {
  transform: translateY(-2px);
  border-color: var(--glass-border-bright);
  box-shadow:
    0 16px 30px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.sys-card.unread {
  border-color: var(--color-hover);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.65),
    0 0 14px rgba(255, 61, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.26);
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
    transform 0.2s ease;
}
.attached-media:hover {
  transform: translateY(-1px);
  border-color: var(--color-hover);
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
