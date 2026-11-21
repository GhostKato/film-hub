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
              <span class="custom-red-checkbox">
                <input type="checkbox" :value="friend.friendUid" v-model="selectedUids" />
                <span class="checkmark"></span>
              </span>
              <UserBadge
                v-if="friend.user"
                :user="friend.user"
                :show-online="true"
                :show-days="false"
              />
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
  background:
    radial-gradient(circle at 12% 0%, rgba(159, 27, 25, 0.24) 0%, transparent 48%),
    radial-gradient(circle at 92% 100%, rgba(25, 85, 235, 0.18) 0%, transparent 52%),
    var(--glass-modal);
  backdrop-filter: blur(24px) saturate(165%);
  -webkit-backdrop-filter: blur(24px) saturate(165%);
  border: 1px solid var(--glass-border-bright);
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow:
    0 28px 65px rgba(0, 0, 0, 0.92),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition: all 0.2s ease;
}
.close-btn:hover {
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.rec-title {
  text-align: center;
  font-size: 17px;
  font-weight: 700;
}
.media-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 11px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
}
.poster {
  width: 44px;
  height: 66px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--glass-border);
}
.meta h4 {
  font-size: 14px;
  margin-bottom: 3px;
}
.meta span {
  font-size: 12px;
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
  font-size: 13px;
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
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
    0 0 10px rgba(159, 27, 25, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
.select-all-btn {
  padding: 0 11px;
  border-radius: 8px;
  background-color: var(--glass-red-soft);
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition: all 0.2s ease;
}
.select-all-btn:hover {
  background-color: var(--glass-red);
  border-color: var(--color-hover);
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
  padding: 9px 11px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: all 0.2s ease;
}
.friend-option:hover {
  border-color: var(--color-hover);
  background-color: rgba(159, 27, 25, 0.16);
}
.custom-red-checkbox {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}
.custom-red-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.custom-red-checkbox .checkmark {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1px solid var(--glass-border-bright);
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
}
.friend-option:hover .custom-red-checkbox input:not(:disabled) ~ .checkmark {
  border-color: var(--color-hover);
  box-shadow: 0 0 8px rgba(255, 61, 0, 0.45);
}
.custom-red-checkbox input:checked ~ .checkmark {
  background-color: var(--glass-red);
  border-color: var(--color-hover);
  box-shadow: 0 0 10px rgba(255, 61, 0, 0.55);
}
.custom-red-checkbox input:checked ~ .checkmark::after {
  content: '✓';
  color: var(--color-white);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}
.submit-btn {
  padding: 10px;
  border-radius: 8px;
  background-color: var(--glass-red);
  border: 1px solid var(--glass-border-bright);
  color: var(--color-white);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: all 0.2s ease;
}
.submit-btn:hover:not(:disabled) {
  background-color: var(--glass-hover);
  border-color: var(--color-hover);
}
.submit-btn:disabled {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.35);
  box-shadow: none;
  cursor: not-allowed;
}
.empty-friends {
  text-align: center;
  color: var(--color-light-grey);
  padding: 16px 0;
  font-size: 13px;
}
</style>
