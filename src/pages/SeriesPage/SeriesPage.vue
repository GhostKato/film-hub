<template>
  <IBackground>
    <div class="series-page">
      <h1 class="title">{{ $t('series_page.title') }}</h1>

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

      <MediaList :items="series" />

      <IPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="fetchSeries(activeCategory, $event)"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import { getPopularTV, getTopRatedTV, getOnTheAirTV, getAiringTodayTV } from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import { useLoaderStore } from '@/stores/loader'
import IButton from '@/components/IButton/IButton.vue'

const { t, locale } = useI18n()

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

const activeCategory = ref('popular')
const series = ref<SeriesItem[]>([])
const currentPage = ref(1)
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
    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loaderStore.hideLoader()
  }
}

const changeCategory = (category: string) => {
  if (activeCategory.value === category) return
  activeCategory.value = category
  currentPage.value = 1
  fetchSeries(category, 1)
}

onMounted(() => fetchSeries(activeCategory.value))

watch(
  () => languageStore.lang,
  () => fetchSeries(activeCategory.value, currentPage.value),
)
</script>

<style scoped>
.series-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
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
  margin-bottom: 5px;
}

@media (min-width: 768px) {
  .series-page {
    display: block;
  }
  .categories {
    padding-left: 20px;
  }
  .title {
    padding-left: 20px;
    font-size: 40px;
  }
  .categories {
    gap: 10px;
  }
}
</style>
