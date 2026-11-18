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
  font-size: 13px;
  font-weight: 700;
  color: var(--color-light-grey);
}
.clear-btn {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  background-color: var(--glass-red);
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  cursor: pointer;
}
.sys-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  margin-bottom: 8px;
  position: relative;
}
.sys-card.clickable {
  cursor: pointer;
}
.sys-card.clickable:hover {
  border-color: var(--color-hover);
}
.sys-card.unread {
  border-color: var(--color-hover);
  box-shadow: 0 0 12px rgba(255, 61, 0, 0.25);
}
.mini-poster {
  width: 44px;
  height: 66px;
  border-radius: 6px;
  object-fit: cover;
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
  padding: 6px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--glass-border);
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}
.attached-media:hover {
  border-color: var(--color-hover);
}
.close-mini {
  background: transparent;
  border: none;
  color: var(--color-light-grey);
  cursor: pointer;
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
