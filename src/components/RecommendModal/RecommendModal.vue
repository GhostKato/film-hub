<template>
  <teleport to="body">
    <div class="rec-backdrop" @click.self="$emit('close')">
      <div class="rec-modal">
        <button class="close-btn" @click="$emit('close')">
          <XIcon width="20" height="20" />
        </button>

        <h3 class="rec-title">{{ $t('chat.recommend_modal_title') }}</h3>

        <div class="media-preview">
          <img
            v-if="media.poster_path"
            :src="getImageUrl(media.poster_path, 'poster', 'w92')"
            class="poster"
            alt="Poster"
          />
          <div class="meta">
            <h4>{{ media.title }}</h4>
            <span v-if="media.release_date">{{ media.release_date.slice(0, 4) }}</span>
          </div>
        </div>

        <div v-if="friendsStore.acceptedFriends.length" class="friends-selector">
          <div class="selector-controls">
            <input
              v-model="filterText"
              type="text"
              class="glass-input"
              :placeholder="$t('chat.search_friend_placeholder')"
            />
            <button type="button" class="select-all-btn" @click="toggleAll">
              {{
                selectedUids.length === filteredFriends.length
                  ? $t('chat.unselect_all')
                  : $t('chat.select_all')
              }}
            </button>
          </div>

          <div class="friends-list">
            <label v-for="friend in filteredFriends" :key="friend.friendUid" class="friend-option">
              <input type="checkbox" :value="friend.friendUid" v-model="selectedUids" />
              <UserBadge v-if="friend.user" :user="friend.user" />
            </label>
          </div>

          <input
            v-model="comment"
            type="text"
            class="glass-input"
            :placeholder="$t('chat.recommend_comment_placeholder')"
          />

          <button
            class="submit-btn"
            :disabled="!selectedUids.length || isSending"
            @click="sendRecommendation"
          >
            {{ $t('chat.send_recommendation_btn', { count: selectedUids.length }) }}
          </button>
        </div>

        <p v-else class="empty-friends">
          {{ $t('chat.no_friends_to_recommend') }}
        </p>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFriendsStore } from '@/stores/friends'
import { useChatStore } from '@/stores/chat'
import { notificationStore } from '@/stores/notifications'
import { getImageUrl } from '@/utils/getImageUrl'
import type { SharedMediaCard } from '@/types/chat'
import XIcon from '@/components/icons/XIcon.vue'
import UserBadge from '@/components/ChatWidget/UserBadge.vue'

const props = defineProps<{
  media: SharedMediaCard
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()
const friendsStore = useFriendsStore()
const chatStore = useChatStore()

const filterText = ref('')
const selectedUids = ref<string[]>([])
const comment = ref('')
const isSending = ref(false)

const filteredFriends = computed(() => {
  const q = filterText.value.trim().toLowerCase()
  if (!q) return friendsStore.acceptedFriends
  return friendsStore.acceptedFriends.filter((f) => f.user?.displayNameLower.includes(q))
})

const toggleAll = () => {
  if (selectedUids.value.length === filteredFriends.value.length) {
    selectedUids.value = []
  } else {
    selectedUids.value = filteredFriends.value.map((f) => f.friendUid)
  }
}

const sendRecommendation = async () => {
  if (!selectedUids.value.length) return
  isSending.value = true
  try {
    await chatStore.recommendMediaToFriends(selectedUids.value, props.media, comment.value)
    notificationStore.success(t('chat.recommendation_sent_success'))
    emit('close')
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.rec-backdrop {
  position: fixed;
  inset: 0;
  z-index: 95;
  background-color: rgba(5, 7, 10, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}
.rec-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  background-color: var(--glass-modal);
  backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid var(--glass-border-bright);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow:
    0 28px 60px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.26);
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--color-white);
  cursor: pointer;
}
.close-btn:hover {
  color: var(--color-hover);
}
.rec-title {
  text-align: center;
  font-size: 18px;
}
.media-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
}
.poster {
  width: 44px;
  height: 66px;
  border-radius: 6px;
  object-fit: cover;
}
.meta span {
  font-size: 13px;
  color: var(--color-light-grey);
}
.friends-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.selector-controls {
  display: flex;
  gap: 8px;
}
.glass-input {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-white);
  outline: none;
}
.glass-input:focus {
  border-color: var(--color-red);
}
.select-all-btn {
  padding: 0 10px;
  border-radius: 8px;
  background-color: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  cursor: pointer;
  white-space: nowrap;
}
.select-all-btn:hover {
  background-color: var(--glass-hover);
}
.friends-list {
  max-height: 190px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.friend-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  cursor: pointer;
}
.friend-option:hover {
  border-color: var(--color-hover);
}
.submit-btn {
  padding: 10px;
  border-radius: 8px;
  background-color: var(--glass-purple);
  border: 1px solid var(--glass-border-bright);
  color: var(--color-white);
  font-weight: 700;
  cursor: pointer;
}
.submit-btn:hover:not(:disabled) {
  background-color: var(--glass-hover);
}
.submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.empty-friends {
  text-align: center;
  color: var(--color-light-grey);
  padding: 16px 0;
}
</style>
