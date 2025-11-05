<template>
  <IBackground>
    <div class="search-results">
      <SearchBar />
      <h1 v-if="query">{{ $t('search_multi_page.search_result') }} "{{ query }}"</h1>

      <MediaList :items="results" :loading="loading" :routePath="route.path" />

      <IPagination
        v-if="query"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="fetchSearchResults(query, $event)"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
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

const query = computed(() => (route.query.query as string) || '')

const fetchSearchResults = async (q: string, page = 1) => {
  if (!q) return
  loading.value = true
  try {
    const data = await searchMulti(q, page)
    results.value = data.results.filter((item: MediaItem) => item.poster_path || item.profile_path)
    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (query.value) fetchSearchResults(query.value)
})

watch(
  () => query.value,
  (newQuery) => {
    results.value = []
    if (newQuery) fetchSearchResults(newQuery)
  },
)
</script>

<style scoped>
.search-results {
  padding: 20px;
}

h1 {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.loading-more {
  text-align: center;
  margin-top: 20px;
}
</style>
