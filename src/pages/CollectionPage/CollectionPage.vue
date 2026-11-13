<template>
  <IBackground>
    <div class="collection-page">
      <h1 class="title">{{ $t('collection_page.title') }}</h1>

      <div class="header-page">
        <div class="tabs">
          <IButton
            v-for="tab in tabs"
            :key="tab.key"
            variant="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="changeTab(tab.key)"
          >
            {{ tab.label }}
          </IButton>
        </div>

        <FiltersBar v-model="filters" />
      </div>
      <MediaList :items="paginatedData" />
      <IPagination
        v-if="totalPages > 1"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="(p) => changePage(p)"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import IButton from '@/components/IButton/IButton.vue'
import FiltersBar from '@/components/FiltersBar/FiltersBar.vue'
import { useMediaStore } from '@/stores/media'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { MAIN_ACCOUNT_ID } from '@/constants/env'
import { useSearchStore } from '@/stores/search'
import { sortCollectionArray } from '@/utils/sortCollectionArray'
import type { FiltersType } from '@/types/filter'
import { getSortTypeFromLS, saveSortTypeToLS } from '@/utils/sortTypeStorage'

const mediaStore = useMediaStore()
const authStore = useAuthStore()
const searchStore = useSearchStore()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

type TabKey = 'recommended' | 'favorites' | 'watch_later'

interface Tab {
  key: TabKey
  label: string
}

const tabs = computed<Tab[]>(() => {
  const baseTabs: Tab[] = [
    { key: 'favorites', label: t('collection_page.favorites') },
    { key: 'watch_later', label: t('collection_page.watch_later') },
  ]
  if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
    baseTabs.unshift({ key: 'recommended', label: t('collection_page.recommended') })
  }
  return baseTabs
})

const activeTab = computed<TabKey>(() => {
  return (
    (route.query.category as TabKey) ||
    (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID ? 'recommended' : 'favorites')
  )
})

const changeTab = (tab: TabKey) => {
  router.push({
    query: { ...route.query, category: tab, page: 1 },
  })
}

watch(
  () => authStore.user?.uid,
  (newUid) => {
    if (route.query.category) return
    const isMain = newUid === MAIN_ACCOUNT_ID
    const newCategory = isMain ? 'favorites' : 'recommended'
    router.replace({
      query: { ...route.query, category: newCategory, page: 1 },
    })
  },
  { immediate: true },
)

const filters = ref<FiltersType>({
  filterType: (route.query.filterType as FiltersType['filterType']) || 'all',
  genre: (route.query.genre as string) || '',
  rating: (route.query.rating as FiltersType['rating']) || 'all',
  year: (route.query.year as string) || '',
  query: (route.query.query as string) || '',
  sortType: getSortTypeFromLS(),
})

const currentData = computed(() => {
  switch (activeTab.value) {
    case 'favorites':
      return mediaStore.favoriteList()
    case 'watch_later':
      return mediaStore.watchLaterList()
    case 'recommended':
      return mediaStore.recommendedList()
    default:
      return []
  }
})

const filteredData = computed(() => {
  return currentData.value.filter((item) => {
    const typeMatch =
      filters.value.filterType === 'all' || item.media_type === filters.value.filterType
    if (!typeMatch) return false

    if (filters.value.genre && !item.genre_ids?.includes(Number(filters.value.genre))) return false

    const vote = item.vote_average || 0
    if (filters.value.rating === 'low' && vote >= 5) return false
    if (filters.value.rating === 'medium' && (vote < 5 || vote >= 8)) return false
    if (filters.value.rating === 'high' && vote < 8) return false

    if (filters.value.year) {
      const release = item.release_date || item.first_air_date || ''
      if (!release.startsWith(filters.value.year)) return false
    }

    if (filters.value.query) {
      const name = item.title || item.name || ''
      if (!name.toLowerCase().includes(filters.value.query.toLowerCase())) return false
    }

    return true
  })
})

const currentPage = ref(Number(route.query.page) || 1)

const pageSize = 20

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize))

const sortType = computed(() => filters.value.sortType ?? 1)

const sortedMedia = computed(() => {
  return sortCollectionArray(filteredData.value, sortType.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedMedia.value.slice(start, start + pageSize)
})

watch(
  () => [
    filters.value.filterType,
    filters.value.genre,
    filters.value.rating,
    filters.value.year,
    filters.value.query,
  ],
  ([filterType, genre, rating, year, query]) => {
    const nextFilterType = filterType || 'all'
    const nextGenre = genre || ''
    const nextRating = rating || 'all'
    const nextYear = year || ''
    const nextQuery = query || ''

    if (
      (route.query.filterType || 'all') === nextFilterType &&
      (route.query.genre || '') === nextGenre &&
      (route.query.rating || 'all') === nextRating &&
      (route.query.year || '') === nextYear &&
      (route.query.query || '') === nextQuery
    ) {
      return
    }

    router.push({
      query: {
        ...route.query,
        category: activeTab.value,
        page: 1,
        filterType: nextFilterType,
        genre: nextGenre,
        rating: nextRating,
        year: nextYear,
        query: nextQuery,
      },
    })
  },
)

watch(
  () => route.query,
  (query) => {
    const nextFilterType = (query.filterType as FiltersType['filterType']) || 'all'
    const nextGenre = (query.genre as string) || ''
    const nextRating = (query.rating as FiltersType['rating']) || 'all'
    const nextYear = (query.year as string) || ''
    const nextQuery = (query.query as string) || ''

    if (filters.value.filterType !== nextFilterType) filters.value.filterType = nextFilterType
    if (filters.value.genre !== nextGenre) filters.value.genre = nextGenre
    if (filters.value.rating !== nextRating) filters.value.rating = nextRating
    if (filters.value.year !== nextYear) filters.value.year = nextYear
    if (filters.value.query !== nextQuery) filters.value.query = nextQuery

    currentPage.value = Number(query.page) || 1
  },
  { immediate: true },
)

watch(filteredData, () => {
  if (totalPages.value > 0 && currentPage.value > totalPages.value) {
    changePage(1)
  }
})

watch(
  () => filters.value.sortType,
  (val) => {
    saveSortTypeToLS(val)
  },
)

const changePage = (p: number) => {
  if (p === currentPage.value) return
  router.push({
    query: { ...route.query, page: p },
  })
}

onMounted(() => {
  searchStore.clearQuery()
  searchStore.hideNotification()
})
</script>

<style scoped>
.collection-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  height: 80vh;
}
.header-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}
.title {
  font-weight: bold;
  text-shadow: 0 0 15px var(--color-shadow-black);
  margin: 0;
  margin-bottom: 10px;
}
.tabs {
  display: flex;
  align-items: center;
  gap: 5px;
}
@media (min-width: 768px) {
  .collection-page {
    display: block;
  }
  .header-page {
    display: flex;
    align-items: flex-start;
    padding-left: 10px;
    padding-right: 10px;
  }
  .title {
    padding-left: 20px;
    font-size: 40px;
  }
}
@media (min-width: 1024px) {
  .header-page {
    padding-left: 20px;
    padding-right: 20px;
  }
  .tabs {
    gap: 10px;
  }
}
@media (min-width: 1280px) {
  .header-page {
    flex-direction: row;
    justify-content: space-between;
  }
  .tabs {
    width: auto;
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
