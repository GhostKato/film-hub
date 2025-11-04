<template>
  <IBackground>
    <div class="series-page">
      <h1>Серіали</h1>

      <div class="categories">
        <button
          type="button"
          v-for="cat in categories"
          :key="cat.key"
          :class="{ active: activeCategory === cat.key }"
          @click="changeCategory(cat.key)"
        >
          {{ cat.label }}
        </button>
      </div>

      <MediaList :items="series" :loading="loading" />

      <IPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="fetchSeries(activeCategory, $event)"
      />

      <div v-if="loading && currentPage > 1" class="loading-more">Завантаження...</div>
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import { getPopularTV, getTopRatedTV, getOnTheAirTV, getAiringTodayTV } from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language.'

interface Category {
  key: string
  label: string
}

interface SeriesItem {
  id: number
  name: string
  first_air_date?: string
  poster_path?: string
  overview?: string
}

const categories: Category[] = [
  { key: 'popular', label: 'Популярні' },
  { key: 'top_rated', label: 'Рейтингові' },
  { key: 'on_the_air', label: 'На ефірі' },
  { key: 'airing_today', label: 'Сьогодні на ефірі' },
]

const activeCategory = ref('popular')
const series = ref<SeriesItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const languageStore = useLanguageStore()

const fetchSeries = async (category: string, page = 1) => {
  loading.value = true
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
    loading.value = false
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
  padding: 20px;
  color: white;
}

h1 {
  font-size: 40px;
  font-weight: bold;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
  margin-bottom: 20px;
}

.categories {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.categories button {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: 0.3s;
}

.categories button.active {
  background: #9f1b19;
  color: white;
}

.categories button:hover {
  background: #ff3d00;
}

.loading-more {
  text-align: center;
  margin-top: 20px;
}
</style>
