<template>
  <div v-if="reviews.length" class="reviews">
    <h2>Відгуки</h2>
    <div v-for="review in reviews" :key="review.id" class="review-card">
      <h3>{{ review.author }}</h3>
      <p>{{ review.content }}</p>
      <small>{{ formatDate(review.created_at) }}</small>
    </div>
    <div v-if="loading" class="loading">Завантаження відгуків...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getMediaReviews } from '@/api/tmdb'
import type { Review, MediaType } from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language'

const props = defineProps<{
  mediaId: number
  type: MediaType
}>()

const reviews = ref<Review[]>([])
const loading = ref(false)
const languageStore = useLanguageStore()

const fetchReviews = async () => {
  loading.value = true
  try {
    reviews.value = await getMediaReviews(props.mediaId, props.type)
  } catch (error) {
    console.error('Помилка при завантаженні відгуків:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchReviews)

watch(() => languageStore.lang, fetchReviews)

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(languageStore.lang)
</script>

<style scoped>
.reviews {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-card {
  background: var(--background-card);
  padding: 15px;
  border-radius: 10px;
  color: var(--color-white);
}

.review-card h3 {
  margin: 0 0 5px 0;
}

.review-card p {
  margin: 0 0 5px 0;
}

.review-card small {
  display: block;
  margin-bottom: 5px;
  opacity: 0.7;
}

.loading {
  text-align: center;
}
</style>
