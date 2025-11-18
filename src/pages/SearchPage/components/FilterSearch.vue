<template>
  <div class="filter-search">
    <div class="text-search">
      <!-- Тип -->
      <select class="select" v-model="filterType" @change="onFilterChange">
        <option value="movie">Movies</option>
        <option value="tv">Series</option>
      </select>

      <!-- Рейтинг -->
      <select class="select" v-model="rating" @change="onFilterChange">
        <option value="all">All ratings</option>
        <option value="low">0-5</option>
        <option value="medium">5-8</option>
        <option value="high">8+</option>
      </select>

      <!-- Жанри -->
      <select class="select" v-model="genre" @change="onFilterChange">
        <option value="">All genres</option>
        <option v-for="g in genres" :key="g.id" :value="g.id">{{ g.name }}</option>
      </select>

      <!-- Рік -->
      <select class="select" v-model="year" @change="onFilterChange">
        <option value="">All years</option>
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <!-- Результати -->
    <div class="media-list-wrapper" v-if="results.length">
      <MediaList :items="results" />
      <IPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="fetchResults($event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import { useLoaderStore } from '@/stores/loader'
import { fetchMovies, fetchTV } from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language'

const loaderStore = useLoaderStore()
const languageStore = useLanguageStore()

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
  { id: 28, name: 'Action' }, // Бойовик
  { id: 12, name: 'Adventure' }, // Пригоди
  { id: 16, name: 'Animation' }, // Анімація
  { id: 35, name: 'Comedy' }, // Комедія
  { id: 80, name: 'Crime' }, // Кримінал
  { id: 99, name: 'Documentary' }, // Документальні
  { id: 18, name: 'Drama' }, // Драма
  { id: 10751, name: 'Family' }, // Сімейні
  { id: 14, name: 'Fantasy' }, // Фентезі
  { id: 36, name: 'History' }, // Історичні
  { id: 27, name: 'Horror' }, // Жахи
  { id: 9648, name: 'Mystery' }, // Детективи
  { id: 10749, name: 'Romance' }, // Романтика
  { id: 878, name: 'Science Fiction' }, // Наукова фантастика
  { id: 10752, name: 'War' }, // Військові
  { id: 53, name: 'Thriller' }, // Трилери
  { id: 37, name: 'Western' }, // Вестерни
])
const years = ref([2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015])

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
.text-search {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.select {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align-last: center;
  height: 40px;
  width: 120px;
  border-radius: 8px;
  font-size: 16px;
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

.option {
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

.media-list-wrapper {
  flex: 1;
}

@media (min-width: 768px) {
  .select {
    height: 48px;
    width: 150px;
    font-size: 18px;
  }
  .option {
    font-size: 18px;
  }
  .result {
    margin: 15px;
    font-size: 18px;
    text-align: start;
  }
}
</style>
