<template>
  <IBackground>
    <div class="movies-page">
      <h1 class="title">{{ $t('movies_page.title') }}</h1>
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

      <MediaList :items="movies" />

      <IPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="fetchMovies(activeCategory, $event)"
      />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
} from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import { useLoaderStore } from '@/stores/loader'

const { t, locale } = useI18n()

interface CategoryMedia {
  key: string
  label: string
}

interface MovieItem {
  id: number
  title: string
  poster_path?: string
  release_date?: string
  vote_average?: number
}

const categories = ref<CategoryMedia[]>([])

watch(
  () => locale.value,
  () => {
    categories.value = [
      { key: 'popular', label: t('movies_page.popular') },
      { key: 'top_rated', label: t('movies_page.top_rated') },
      { key: 'now_playing', label: t('movies_page.now_playing') },
      { key: 'upcoming', label: t('movies_page.upcoming') },
    ]
  },
  { immediate: true },
)

const activeCategory = ref('popular')
const movies = ref<MovieItem[]>([])
const currentPage = ref(1)
const totalPages = ref(1)

const loader = useLoaderStore()
const languageStore = useLanguageStore()

const fetchMovies = async (category: string, page = 1) => {
  loader.showLoader()
  try {
    let data
    switch (category) {
      case 'popular':
        data = await getPopularMovies(page)
        break
      case 'top_rated':
        data = await getTopRatedMovies(page)
        break
      case 'now_playing':
        data = await getNowPlayingMovies(page)
        break
      case 'upcoming':
        data = await getUpcomingMovies(page)
        break
    }

    movies.value = data.results.filter((item: MovieItem) => item.poster_path)
    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loader.hideLoader()
  }
}

const changeCategory = (category: string) => {
  if (activeCategory.value === category) return
  activeCategory.value = category
  currentPage.value = 1
  fetchMovies(category, 1)
}

onMounted(() => fetchMovies(activeCategory.value))

watch(
  () => languageStore.lang,
  () => fetchMovies(activeCategory.value, currentPage.value),
)
</script>

<style scoped>
.movies-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
}

.title {
  font-weight: bold;
  text-shadow: 0 0 15px var(--color-shadow);
  margin: 0;
  margin-bottom: 20px;
}

.categories {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.categories button {
  padding: 5px 5px;
  border: none;
  border-radius: 8px;
  background: var(--color-dark-grey);
  color: var(--color-white);
  cursor: pointer;
  transition: 0.3s;
}

.categories button.active {
  background: var(--color-red);
  color: var(--color-white);
}

.categories button:hover {
  background: var(--color-hover);
}

.loading-more {
  text-align: center;
  margin-top: 20px;
}
@media (min-width: 768px) {
  .movies-page {
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

  .categories button {
    padding: 10px 15px;
  }
}
</style>
