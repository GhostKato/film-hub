<template>
  <IBackground>
    <div class="filter-search-page">
      <h1 class="title">{{ $t('filter_search_page.title') }}</h1>
      <div class="select-container">
        <select class="select" v-model="filterType" @change="onFilterChange">
          <option value="movie">{{ t('filter_search_page.movies') }}</option>
          <option value="tv">{{ t('filter_search_page.series') }}</option>
        </select>
        <select class="select" v-model="genre" @change="onFilterChange">
          <option value="">{{ t('filter_search_page.all_genres') }}</option>
          <option v-for="g in genres" :key="g.id" :value="g.id">{{ t(g.name) }}</option>
        </select>
        <select class="select" v-model="rating" @change="onFilterChange">
          <option value="all">{{ t('filter_search_page.all_ratings') }}</option>
          <option value="high">{{ t('filter_search_page.ratings') }} 8+</option>
          <option value="medium">{{ t('filter_search_page.ratings') }} 5-7</option>
          <option value="low">{{ t('filter_search_page.ratings') }} 0-5</option>
        </select>
        <select class="select" v-model="year" @change="onFilterChange">
          <option value="">{{ t('filter_search_page.all_years') }}</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <div v-if="results.length">
        <MediaList :items="results" />
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
import { ref, onMounted, watch } from 'vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import { useLoaderStore } from '@/stores/loader'
import { fetchMovies, fetchTV } from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import IBackground from '@/components/IBackground/IBackground.vue'

const loaderStore = useLoaderStore()
const languageStore = useLanguageStore()
const { t } = useI18n()

const filterType = ref<'movie' | 'tv'>('movie')
const rating = ref<'all' | 'low' | 'medium' | 'high'>('all')
const genre = ref<string>('')
const year = ref<string>('')

interface MediaItem {
  id: number
  media_type: 'movie' | 'tv'
  title?: string
  name?: string
  poster_path?: string
  first_air_date?: string
  release_date?: string
}

const results = ref<MediaItem[]>([])
const currentPage = ref(1)
const totalPages = ref(1)

const genres = ref([
  { id: 28, name: 'filter_search_page.action' },
  { id: 35, name: 'filter_search_page.comedy' },
  { id: 10751, name: 'filter_search_page.family' },
  { id: 12, name: 'filter_search_page.adventure' },
  { id: 14, name: 'filter_search_page.fantasy' },
  { id: 99, name: 'filter_search_page.documentary' },
  { id: 18, name: 'filter_search_page.drama' },
  { id: 36, name: 'filter_search_page.history' },
  { id: 80, name: 'filter_search_page.crime' },
  { id: 9648, name: 'filter_search_page.mystery' },
  { id: 27, name: 'filter_search_page.horror' },
  { id: 53, name: 'filter_search_page.thriller' },
  { id: 10752, name: 'filter_search_page.war' },
  { id: 37, name: 'filter_search_page.western' },
  { id: 10749, name: 'filter_search_page.romance' },
  { id: 16, name: 'filter_search_page.animation' },
])
const years = ref([
  2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
])

const fetchResults = async (page = 1) => {
  loaderStore.showLoader()
  try {
    let data
    if (filterType.value === 'movie') {
      data = await fetchMovies({
        rating: rating.value,
        genre: genre.value,
        year: year.value,
        page,
      })
    } else {
      data = await fetchTV({
        rating: rating.value,
        genre: genre.value,
        year: year.value,
        page,
      })
    }
    results.value = data.results
    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loaderStore.hideLoader()
  }
}

const onFilterChange = () => {
  currentPage.value = 1
  fetchResults()
}

onMounted(() => {
  fetchResults()
})
watch(
  () => languageStore.lang,
  () => {
    currentPage.value = 1
    fetchResults()
  },
)
</script>

<style scoped>
.filter-search-page {
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
.select-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 5px;
  max-width: 400px;
}

.select {
  height: 27px;
  width: 170px;
  border-radius: 8px;
  color: var(--color-white);
  background-color: var(--color-dark-grey);
  border: none;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.select:hover {
  outline: 1px solid var(--color-hover);
}

.select option {
  font-size: 16px;
  text-align: center;
  border: none;
}

.option:checked {
  background-color: var(--color-red);
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
  .title {
    padding-left: 20px;
    font-size: 40px;
  }
  .select-container {
    justify-content: flex-start;
    max-width: 100%;
    padding-left: 20px;
    gap: 10px;
  }
  .select {
    height: 33px;
    width: 140px;
    font-size: 20px;
  }
  .select option {
    font-size: 20px;
  }
  .result {
    margin: 15px;
    font-size: 18px;
    text-align: start;
  }
}
@media (min-width: 2560px) {
  .select {
    height: 43px;
  }
}
</style>
