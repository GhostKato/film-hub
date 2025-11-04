<template>
  <IBackground>
    <div class="search-results">
      <SearchBar />
      <h1>Результати пошуку: "{{ route.query.query }}"</h1>

      <MediaList :items="results" :loading="loading" />

      <IPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="fetchSearchResults(route.query.query as string, $event)"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
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

.loading-more {
  text-align: center;
  margin-top: 20px;
}
</style>
