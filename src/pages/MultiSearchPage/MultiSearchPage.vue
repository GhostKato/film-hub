<template>
  <IBackground>
    <div class="search-page">
      <SearchBar @search="handleSearch" />

      <h3 class="result" v-if="searchStore.query">
        {{ $t('multi_search_page.search_result') }} "{{ searchStore.query }}"
      </h3>

      <div class="media-list-wrapper">
        <MediaList :items="filteredResults" :routePath="route.path" />
      </div>

      <IPagination
        v-if="searchStore.query"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="changePage"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '../../components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import { useLoaderStore } from '@/stores/loader'
import { useLanguageStore } from '@/stores/language'
import { searchMulti } from '@/api/tmdb'
import { useSearchStore } from '@/stores/search'
import type { TmdbItemType } from '@/types/media'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'

const loaderStore = useLoaderStore()
const languageStore = useLanguageStore()
const searchStore = useSearchStore()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const results = ref<TmdbItemType[]>([])
const currentPage = ref(Number(route.query.page) || 1)
const totalPages = ref(1)

const fetchSearchResults = async (q: string, page = 1) => {
  if (!q.trim()) return
  searchStore.hideNotification()
  loaderStore.showLoader()
  try {
    const data = await searchMulti(q, page)
    results.value = data.results.filter((item: TmdbItemType) => item.poster_path)
    currentPage.value = data.page
    totalPages.value = data.total_pages
    if (results.value.length === 0) {
      searchStore.showNotification()
    }
  } catch {
    notificationStore.error(t('notification_message.multi_search_error'))
  } finally {
    loaderStore.hideLoader()
  }
}

const filteredResults = computed(() => {
  if (searchStore.type === 'all') return results.value
  return results.value.filter((item) => item.media_type === searchStore.type)
})

const handleSearch = (q: string) => {
  router.push({
    path: '/multi-search',
    query: { query: q, page: 1 },
  })
}

const changePage = (page: number) => {
  if (page === currentPage.value) return
  router.push({
    path: '/multi-search',
    query: { ...route.query, query: searchStore.query, page },
  })
}

watch(
  () => [route.query.query, route.query.page, languageStore.lang],
  () => {
    const q = (route.query.query as string) || ''
    const page = Number(route.query.page) || 1
    if (q) {
      searchStore.query = q
      currentPage.value = page
      fetchSearchResults(q, page)
    }
  },
  { immediate: true },
)

watch(
  () => searchStore.query,
  (newQuery) => {
    if (!newQuery.trim()) {
      results.value = []
      totalPages.value = 1
    }
  },
)

watch(
  () => searchStore.type,
  () => {
    if (!searchStore.query.trim()) return
    router.push({
      path: '/multi-search',
      query: { query: searchStore.query, page: 1 },
    })
  },
)
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  height: 80vh;
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
  }
}
@media (min-width: 1024px) {
  .media-list-wrapper {
    flex: 1;
  }
  .result {
    font-size: 20px;
    text-align: start;
  }
}
</style>
