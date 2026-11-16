<template>
  <div v-if="reviews.length" class="reviews">
    <h2 class="reviews-title">{{ $t('media_page.reviews_title') }}</h2>
    <div v-for="review in reviews" :key="review.id" class="review-card">
      <div class="review-header">
        <h3 class="author">{{ review.author }}</h3>
        <small class="date">{{ formatDate(review.created_at) }}</small>
      </div>
      <p class="content">
        {{ getDisplayContent(review) }}
      </p>
      <button
        v-if="review.content.length > MAX_LENGTH"
        type="button"
        class="read-more-btn"
        @click="toggleExpand(review.id)"
      >
        {{ expandedIds[review.id] ? $t('media_page.show_less') : $t('media_page.read_more') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getMediaReviews } from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language'
import type { ReviewType } from '@/types/review'
import type { MediaType } from '@/types/fetchTmdb'
import { notificationStore } from '@/stores/notifications'
import { useLoaderStore } from '@/stores/loader'
import { useI18n } from 'vue-i18n'

const loaderStore = useLoaderStore()
const { t } = useI18n()

const props = defineProps<{
  mediaId: number
  type: MediaType
}>()

const MAX_LENGTH = 400
const reviews = ref<ReviewType[]>([])
const expandedIds = ref<Record<string, boolean>>({})
const languageStore = useLanguageStore()

const toggleExpand = (id: string) => {
  expandedIds.value[id] = !expandedIds.value[id]
}

const getDisplayContent = (review: ReviewType) => {
  if (review.content.length <= MAX_LENGTH || expandedIds.value[review.id]) {
    return review.content
  }
  return review.content.slice(0, MAX_LENGTH).trim() + '...'
}

const fetchReviews = async () => {
  try {
    loaderStore.showLoader()
    reviews.value = await getMediaReviews(props.mediaId, props.type)
  } catch {
    notificationStore.error(t('notification_message.reviews_error'))
  } finally {
    loaderStore.hideLoader()
  }
}

onMounted(fetchReviews)

watch(() => languageStore.lang, fetchReviews)

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(languageStore.lang)
</script>

<style scoped>
.reviews {
  margin: 30px auto 0;
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.reviews-title {
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.85);
}

.review-card {
  background: var(--glass-card);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.65),
    0 4px 12px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 12px;
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.review-card:hover {
  transform: translateY(-3px);
  border-color: var(--glass-border-bright);
  box-shadow:
    0 22px 42px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 8px;
}

.author {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
}

.date {
  opacity: 0.7;
  font-size: 0.9rem;
}

.content {
  margin: 0;
  line-height: 1.6;
  color: var(--color-light-grey);
  white-space: pre-line;
}

.read-more-btn {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  color: var(--color-red);
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;
}

.read-more-btn:hover {
  color: var(--color-hover);
}
</style>
