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
        @update:page="fetchResults($event)"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { fetchDiscoverMovies, fetchDiscoverTV } from '@/api/tmdb'
import { useLoaderStore } from '@/stores/loader'
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
      if (filters.value.rating === 'low' && vote > 5) return false
      if (filters.value.rating === 'medium' && (vote < 5 || vote > 8)) return false
      if (filters.value.rating === 'high' && vote < 8) return false
    }

    if (filters.value.year) {
      const release = item.release_date || item.first_air_date || ''
      if (!release.startsWith(filters.value.year)) return false
    }

    return true
  })
})

const fetchResults = async (page = currentPage.value) => {
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
        ? 'notification_message.movies_error'
        : 'notification_message.series_error'
    notificationStore.error(t(key))
  } finally {
    loaderStore.hideLoader()
  }
}

watch(
  filters,
  () => {
    router.push({
      path: '/filter-search',
      query: {
        type: filters.value.filterType,
        genre: filters.value.genre || '',
        rating: filters.value.rating || 'all',
        year: filters.value.year || '',
        page: 1,
      },
    })
  },
  { deep: true },
)

watch(
  () => route.query,
  (query) => {
    filters.value.filterType = (query.type as 'movie' | 'tv') || 'movie'
    filters.value.genre = (query.genre as string) || ''
    filters.value.rating = (query.rating as 'all' | 'low' | 'medium' | 'high') || 'all'
    filters.value.year = (query.year as string) || ''
    currentPage.value = Number(query.page) || 1

    fetchResults(currentPage.value)
  },
  { immediate: true },
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
