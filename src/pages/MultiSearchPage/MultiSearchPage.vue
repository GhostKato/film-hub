<template>
  <IBackground>
    <div class="search-page">
      <SearchBar @search="fetchSearchResults" />

      <h3 class="result" v-if="useMultiSearch.query">
        {{ $t('multi_search_page.search_result') }} "{{ useMultiSearch.query }}"
      </h3>

      <div class="media-list-wrapper">
        <MediaList :items="filteredResults" :routePath="route.path" />
      </div>

      <IPagination
        v-if="useMultiSearch.query"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="fetchSearchResults(useMultiSearch.query, $event)"
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
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import { useLoaderStore } from '@/stores/loader'
import { searchMulti } from '@/api/tmdb'
import { useMultiSearchStore } from '@/stores/multi-search'

const loaderStore = useLoaderStore()
const useMultiSearch = useMultiSearchStore()
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
}

const results = ref<MediaItem[]>([])
const currentPage = ref(1)
const totalPages = ref(1)

const fetchSearchResults = async (q: string, page = 1) => {
  if (!q) return
  loaderStore.showLoader()
  useMultiSearch.startSearch()
  try {
    const data = await searchMulti(q, page)
    results.value = data.results.filter((item: MediaItem) => item.poster_path || item.profile_path)
    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loaderStore.hideLoader()
    setTimeout(() => {
      useMultiSearch.finishSearch()
    }, 5000)
  }
}

const filteredResults = computed(() => {
  if (useMultiSearch.type === 'all') return results.value
  return results.value.filter((item) => item.media_type === useMultiSearch.type)
})

onMounted(() => {
  if (useMultiSearch.query) fetchSearchResults(useMultiSearch.query)
})

watch(
  () => useMultiSearch.query,
  (newQuery) => {
    if (!newQuery.trim()) {
      results.value = []
    }
  },
)

watch(
  () => useMultiSearch.type,
  () => {
    if (!useMultiSearch.query.trim()) return
    currentPage.value = 1
    fetchSearchResults(useMultiSearch.query, 1)
  },
)
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
}

.result {
  font-weight: bold;
  margin: 10px;
  text-align: center;
  font-size: 16px;
}

@media (min-width: 768px) {
  .search-page {
    display: block;
  }

  .result {
    margin: 15px;
    font-size: 20px;
    text-align: start;
  }
}
@media (min-width: 1024px) {
  /* .main-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  } */
  .media-list-wrapper {
    flex: 1;
  }
}
</style>
