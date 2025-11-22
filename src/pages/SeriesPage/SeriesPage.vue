<template>
  <IBackground>
    <div class="series-page">
      <h1 class="title">{{ $t('series_page.title') }}</h1>

      <div class="header-page">
        <div class="categories">
          <IButton
            variant="categories-btn"
            v-for="cat in categories"
            :key="cat.key"
            :class="{ active: activeCategory === cat.key }"
            @click="changeCategory(cat.key)"
          >
            {{ cat.label }}
          </IButton>
        </div>
        <div class="search-bar-container">
          <SearchBar />
        </div>
      </div>

      <MediaList :items="series" />

      <IPagination :currentPage="currentPage" :totalPages="totalPages" @update:page="changePage" />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import { getPopularTV, getTopRatedTV, getOnTheAirTV, getAiringTodayTV } from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import { useLoaderStore } from '@/stores/loader'
import IButton from '@/components/IButton/IButton.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

interface CategoryMedia {
  key: string
  label: string
}

interface SeriesItem {
  id: number
  name: string
  poster_path?: string
  first_air_date?: string
  vote_average?: number
}

const categories = ref<CategoryMedia[]>([])

watch(
  () => locale.value,
  () => {
    categories.value = [
      { key: 'popular', label: t('series_page.popular') },
      { key: 'top_rated', label: t('series_page.top_rated') },
      { key: 'on_the_air', label: t('series_page.on_the_air') },
      { key: 'airing_today', label: t('series_page.airing_today') },
    ]
  },
  { immediate: true },
)

watch(
  () => route.query,
  () => {
    const hasCategory = !!route.query.category
    const hasPage = !!route.query.page

    if (!hasCategory || !hasPage) {
      router.replace({
        query: {
          category: hasCategory ? route.query.category : 'popular',
          page: hasPage ? route.query.page : 1,
        },
      })
    }
  },
  { immediate: true },
)

const activeCategory = computed({
  get: () => (route.query.category as string) || 'popular',
  set: (value: string) => {
    router.push({
      query: {
        ...route.query,
        category: value,
        page: 1,
      },
    })
  },
})

const currentPage = computed({
  get: () => Number(route.query.page) || 1,
  set: (value: number) => {
    router.push({
      query: {
        ...route.query,
        page: value,
      },
    })
  },
})

const series = ref<SeriesItem[]>([])
const totalPages = ref(1)

const loaderStore = useLoaderStore()
const languageStore = useLanguageStore()

const fetchSeries = async (category: string, page = 1) => {
  loaderStore.showLoader()
  try {
    let data
    switch (category) {
      case 'popular':
        data = await getPopularTV(page)
        break
      case 'top_rated':
        data = await getTopRatedTV(page)
        break
      case 'on_the_air':
        data = await getOnTheAirTV(page)
        break
      case 'airing_today':
        data = await getAiringTodayTV(page)
        break
    }

    series.value = data.results.filter((item: SeriesItem) => item.poster_path)
    totalPages.value = data.total_pages
  } finally {
    loaderStore.hideLoader()
  }
}
const changeCategory = (category: string) => {
  activeCategory.value = category
}
const changePage = (page: number) => {
  currentPage.value = page
}

watch(
  () => [activeCategory.value, currentPage.value, languageStore.lang],
  () => {
    fetchSeries(activeCategory.value, currentPage.value)
  },
  { immediate: true },
)
</script>

<style scoped>
.series-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
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

.categories {
  display: flex;
  gap: 5px;
}

@media (min-width: 768px) {
  .series-page {
    display: block;
  }
  .header-page {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-left: 20px;
    padding-right: 20px;
  }
  .title {
    padding-left: 20px;
    font-size: 40px;
  }
  .categories {
    gap: 10px;
  }
  .search-bar-container {
    display: block;
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
