<template>
  <IBackground>
    <div class="filter-search-page">
      <h1 class="title">{{ $t('filter_search_page.title') }}</h1>

      <div class="header-page">
        <FiltersBar v-model="filters" />

        <div class="search-bar-container">
          <SearchBar />
        </div>
      </div>

      <div v-if="filteredMedia.length">
        <MediaList :items="filteredMedia" />
      </div>

      <IPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="fetchResults($event)"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { fetchMovies, fetchTV } from '@/api/tmdb'
import { useLoaderStore } from '@/stores/loader'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import FiltersBar from '@/components/FiltersBar/FiltersBar.vue'
import type { FiltersType } from '@/components/FiltersBar/FiltersBar.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'

interface MediaItem {
  id: number
  media_type: 'movie' | 'tv'
  title?: string
  name?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  genre_ids?: number[]
  vote_average?: number
}

const loaderStore = useLoaderStore()

const filters = ref<FiltersType>({
  filterType: 'movie',
  genre: '',
  rating: 'all',
  year: '',
})

const allMedia = ref<MediaItem[]>([])
const currentPage = ref(1)
const totalPages = ref(1)

// Фільтрація локально через computed
const filteredMedia = computed(() => {
  return allMedia.value.filter((item) => {
    // жанр
    if (filters.value.genre && !item.genre_ids?.includes(Number(filters.value.genre))) return false

    // рейтинг
    if (filters.value.rating !== 'all') {
      const vote = item.vote_average || 0
      if (filters.value.rating === 'low' && vote > 5) return false
      if (filters.value.rating === 'medium' && (vote < 5 || vote > 8)) return false
      if (filters.value.rating === 'high' && vote < 8) return false
    }

    // рік
    if (filters.value.year) {
      const release = item.release_date || item.first_air_date || ''
      if (!release.startsWith(filters.value.year)) return false
    }

    return true
  })
})

// Запит до TMDB
const fetchResults = async (page = 1) => {
  loaderStore.showLoader()
  try {
    const data =
      filters.value.filterType === 'movie'
        ? await fetchMovies({
            rating: filters.value.rating,
            genre: filters.value.genre,
            year: filters.value.year,
            page,
          })
        : await fetchTV({
            rating: filters.value.rating,
            genre: filters.value.genre,
            year: filters.value.year,
            page,
          })

    allMedia.value = (data.results || []).map((item: any) => ({
      ...item,
      media_type: filters.value.filterType,
    }))

    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loaderStore.hideLoader()
  }
}

// Перезапуск запиту при зміні фільтрів
watch(
  filters,
  () => {
    currentPage.value = 1
    fetchResults()
  },
  { deep: true },
)

onMounted(() => {
  fetchResults()
})
</script>

<style scoped>
.filter-search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
}
.header-page {
  margin-bottom: 5px;
}
.title {
  font-weight: bold;
  text-shadow: 0 0 15px var(--color-shadow);
  margin: 0;
  margin-bottom: 10px;
}

.result {
  font-weight: bold;
  margin: 10px;
  text-align: center;
  font-size: 16px;
}
.search-bar-container {
  display: none;
}
@media (min-width: 768px) {
  .filter-search-page {
    display: block;
  }
  .header-page {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 20px;
    padding-right: 20px;
  }
  .title {
    padding-left: 20px;
    font-size: 40px;
  }

  .result {
    margin: 15px;
    font-size: 18px;
    text-align: start;
  }
}
@media (min-width: 1024px) {
  .search-bar-container {
    display: block;
  }
}
</style>
