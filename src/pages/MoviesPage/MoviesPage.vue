<template>
  <IBackground>
    <div class="movies-page">
      <h1>Фільми</h1>

      <div class="categories">
        <button
          type="button"
          v-for="cat in categories"
          :key="cat.key"
          :class="{ active: activeCategory === cat.key }"
          @click="changeCategory(cat.key)"
        >
          {{ cat.label }}
        </button>
      </div>

      <MediaList :items="movies" :loading="loading" />

      <div class="pagination" v-if="totalPages > 1">
        <button type="button" @click="prevPage" :disabled="currentPage === 1">Попередня</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" @click="nextPage" :disabled="currentPage === totalPages">
          Наступна
        </button>
      </div>

      <div v-if="loading && currentPage > 1" class="loading-more">Завантаження...</div>
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
} from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language.'

interface Category {
  key: string
  label: string
}

interface MovieItem {
  id: number
  title: string
  name?: string
  poster_path?: string
  release_date?: string
  overview?: string
}

const categories: Category[] = [
  { key: 'popular', label: 'Популярні' },
  { key: 'top_rated', label: 'Рейтингові' },
  { key: 'now_playing', label: 'Зараз у кіно' },
  { key: 'upcoming', label: 'Очікувані' },
]

const activeCategory = ref('popular')
const movies = ref<MovieItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const languageStore = useLanguageStore()

const fetchMovies = async (category: string, page = 1) => {
  loading.value = true
  try {
    let data
    switch (category) {
      case 'popular':
        data = await getPopularMovies(page)
        break
      case 'top_rated':
        data = await getTopRatedMovies(page)
        break
      case 'now_playing':
        data = await getNowPlayingMovies(page)
        break
      case 'upcoming':
        data = await getUpcomingMovies(page)
        break
    }
    movies.value = data.results.filter((item: MovieItem) => item.poster_path)
    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loading.value = false
  }
}

const changeCategory = (category: string) => {
  if (activeCategory.value === category) return
  activeCategory.value = category
  currentPage.value = 1
  fetchMovies(category, 1)
}

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchMovies(activeCategory.value, currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchMovies(activeCategory.value, currentPage.value + 1)
  }
}

onMounted(() => {
  fetchMovies(activeCategory.value, currentPage.value)
})

watch(
  () => languageStore.lang,
  () => {
    fetchMovies(activeCategory.value, currentPage.value)
  },
)
</script>

<style scoped>
.movies-page {
  padding: 20px;
  color: white;
}

h1 {
  font-size: 40px;
  font-weight: bold;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
  margin-bottom: 20px;
}

.categories {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.categories button {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: 0.3s;
}

.categories button.active {
  background: #ff3d00;
  color: white;
}

.categories button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.pagination {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: default;
}

.loading-more {
  text-align: center;
  margin-top: 20px;
}
</style>
