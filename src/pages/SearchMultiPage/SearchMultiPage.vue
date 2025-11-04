<template>
  <IBackground>
    <div class="search-results">
      <SearchBar />
      <h1>Результати пошуку: "{{ route.query.query }}"</h1>

      <MediaList :items="results" :loading="loading" />

      <div class="pagination" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">Попередня</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Наступна</button>
      </div>
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import { searchMulti } from '@/api/tmdb'
import SearchBar from '@/components/SearchBar/SearchBar.vue'

const route = useRoute()

interface MediaItem {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  title?: string
  name?: string
  poster_path?: string
  profile_path?: string
  first_air_date?: string
  release_date?: string
  overview?: string
}

const results = ref<MediaItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const fetchSearchResults = async (query: string, page = 1) => {
  if (!query) return
  loading.value = true
  try {
    const data = await searchMulti(query, page)
    results.value = data.results.filter((item: MediaItem) => item.poster_path || item.profile_path)
    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchSearchResults(route.query.query as string))

watch(
  () => route.query.query,
  (newQuery) => fetchSearchResults(newQuery as string),
)

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchSearchResults(route.query.query as string, currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchSearchResults(route.query.query as string, currentPage.value + 1)
  }
}
</script>

<style scoped>
.search-results {
  padding: 20px;
  color: white;
}

h1 {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 20px;
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
</style>
