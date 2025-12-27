<template>
  <IBackground>
    <div class="movies-page">
      <h1 class="title">{{ $t('movies_page.title') }}</h1>
      <div class="header-page">
        <div class="tabs">
          <IButton
            variant="tab-btn"
            v-for="cat in categories"
            :key="cat.key"
            :class="{ active: activeCategory === cat.key }"
            @click="changeCategory(cat.key)"
          >
            {{ cat.label }}
          </IButton>
        </div>
        <SearchBar />
      </div>
      <MediaList :items="movies" />
      <IPagination :currentPage="currentPage" :totalPages="totalPages" @update:page="changePage" />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import IButton from '@/components/IButton/IButton.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import { useSearchStore } from '@/stores/search'
import type { TmdbItemType } from '@/types/media'
import { notificationStore } from '@/stores/notifications'

const searchStore = useSearchStore()
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

interface CategoryMedia {
  key: string
  label: string
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

const movies = ref<TmdbItemType[]>([])
const totalPages = ref(1)

const loaderStore = useLoaderStore()
const languageStore = useLanguageStore()

const fetchMovies = async (category: string, page = 1) => {
  loaderStore.showLoader()
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

    movies.value = data.results.filter((item: TmdbItemType) => item.poster_path)
    totalPages.value = data.total_pages
  } catch {
    notificationStore.error(t('notification_message.movies_error'))
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
    fetchMovies(activeCategory.value, currentPage.value)
  },
  { immediate: true },
)
onMounted(() => {
  searchStore.clearQuery()
  searchStore.hideNotification()
})
</script>

<style scoped>
.movies-page {
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

.tabs {
  display: flex;
  align-items: center;
  gap: 5px;
}

@media (min-width: 768px) {
  .movies-page {
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
  .tabs {
    gap: 10px;
  }
  .search-bar-container {
    display: block;
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
