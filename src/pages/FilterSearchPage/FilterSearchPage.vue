<template>
  <IBackground>
    <div class="filter-search-page">
      <h1 class="title">{{ $t('filter_search_page.title') }}</h1>
      <div class="header-page">
        <FiltersBar v-model="filters" />
        <SearchBar />
      </div>
      <MediaList :items="filteredMedia" />
      <IPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="changePage($event)"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { fetchDiscoverMovies, fetchDiscoverTV } from '@/api/tmdb'
import { useLoaderStore } from '@/stores/loader'
import { useLanguageStore } from '@/stores/language'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import FiltersBar from '@/components/FiltersBar/FiltersBar.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import type { FiltersType } from '@/types/filter'
import type { TmdbItemType } from '@/types/media'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'

const loaderStore = useLoaderStore()
const languageStore = useLanguageStore()
const route = useRoute()
const { t } = useI18n()

const filters = ref<FiltersType>({
  filterType: (route.query.type as 'movie' | 'tv') || 'movie',
  genre: (route.query.genre as string) || '',
  rating: (route.query.rating as 'all' | 'low' | 'medium' | 'high') || 'all',
  year: (route.query.year as string) || '',
})

const allMedia = ref<TmdbItemType[]>([])
const currentPage = ref(Number(route.query.page) || 1)
const totalPages = ref(1)

const filteredMedia = computed(() => {
  return allMedia.value.filter((item) => {
    if (filters.value.genre && !item.genre_ids?.includes(Number(filters.value.genre))) return false

    if (filters.value.rating !== 'all') {
      const vote = item.vote_average || 0
      if (filters.value.rating === 'low' && vote >= 5) return false
      if (filters.value.rating === 'medium' && (vote < 5 || vote >= 8)) return false
      if (filters.value.rating === 'high' && vote < 8) return false
    }

    if (filters.value.year) {
      const release = item.release_date || item.first_air_date || ''
      if (!release.startsWith(filters.value.year)) return false
    }

    return true
  })
})

const changePage = (page: number) => {
  router.push({
    path: '/filter-search',
    query: {
      type: filters.value.filterType,
      genre: filters.value.genre || '',
      rating: filters.value.rating || 'all',
      year: filters.value.year || '',
      page,
    },
  })
}

const fetchResults = async (page = currentPage.value) => {
  loaderStore.showLoader()
  try {
    const params = {
      ...filters.value,
      page,
      genre: filters.value.genre || '',
      year: filters.value.year || '',
    }

    const data =
      filters.value.filterType === 'movie'
        ? await fetchDiscoverMovies(params)
        : await fetchDiscoverTV(params)

    allMedia.value = (data.results || []).map((item: any) => ({
      ...item,
      media_type: filters.value.filterType,
    }))

    currentPage.value = data.page
    totalPages.value = data.total_pages
  } catch {
    const key =
      filters.value.filterType === 'movie'
        ? 'notification_message.filter_movies_error'
        : 'notification_message.filter_series_error'
    notificationStore.error(t(key))
  } finally {
    loaderStore.hideLoader()
  }
}

watch(
  () => [filters.value.filterType, filters.value.genre, filters.value.rating, filters.value.year],
  ([type, genre, rating, year]) => {
    const nextType = type || 'movie'
    const nextGenre = genre || ''
    const nextRating = rating || 'all'
    const nextYear = year || ''

    if (
      (route.query.type || 'movie') === nextType &&
      (route.query.genre || '') === nextGenre &&
      (route.query.rating || 'all') === nextRating &&
      (route.query.year || '') === nextYear
    ) {
      return
    }

    changePage(1)
  },
)

watch(
  () => [route.query, languageStore.lang],
  () => {
    const query = route.query
    const nextType = (query.type as 'movie' | 'tv') || 'movie'
    const nextGenre = (query.genre as string) || ''
    const nextRating = (query.rating as 'all' | 'low' | 'medium' | 'high') || 'all'
    const nextYear = (query.year as string) || ''

    if (filters.value.filterType !== nextType) filters.value.filterType = nextType
    if (filters.value.genre !== nextGenre) filters.value.genre = nextGenre
    if (filters.value.rating !== nextRating) filters.value.rating = nextRating
    if (filters.value.year !== nextYear) filters.value.year = nextYear

    currentPage.value = Number(query.page) || 1
    fetchResults(currentPage.value)
  },
  { immediate: true },
)
</script>

<style scoped>
.filter-search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  height: 80vh;
}
.header-page {
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  margin-bottom: 5px;
}
.title {
  font-weight: bold;
  text-shadow: 0 0 15px var(--color-shadow-black);
  margin: 0;
  margin-bottom: 10px;
}

.result {
  font-weight: bold;
  margin: 10px;
  text-align: center;
  font-size: 16px;
}

@media (min-width: 768px) {
  .filter-search-page {
    display: block;
  }
  .header-page {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;
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
  .header-page {
    padding-left: 20px;
    padding-right: 20px;
  }
}
@media (min-width: 2560px) {
  .header-page {
    margin-bottom: 15px;
  }
  .title {
    margin-bottom: 30px;
  }
}
</style>
