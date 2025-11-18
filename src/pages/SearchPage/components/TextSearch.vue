<template>
  <div class="main-container">
    <div class="text-search">
      <select class="select" v-model="filterType">
        <option
          class="option"
          v-for="option in filterOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ t(option.label) }}
        </option>
      </select>
      <SearchBar />
    </div>

    <h3 class="result" v-if="query">{{ $t('search_page.search_result') }} "{{ query }}"</h3>

    <div class="media-list-wrapper">
      <MediaList :items="filteredResults" :routePath="route.path" />
    </div>

    <IPagination
      v-if="query"
      :currentPage="currentPage"
      :totalPages="totalPages"
      @update:page="fetchSearchResults(query, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import MediaList from '@/components/MediaList/MediaList.vue'
import IPagination from '@/components/IPagination/IPagination.vue'
import { searchMulti } from '@/api/tmdb'
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import { useLoaderStore } from '@/stores/loader'
import { useI18n } from 'vue-i18n'

const loaderStore = useLoaderStore()
const route = useRoute()
const { t } = useI18n()

interface MediaItem {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  title?: string
  name?: string
  poster_path?: string
  profile_path?: string
  first_air_date?: string
  release_date?: string
}

const results = ref<MediaItem[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const filterType = ref<'all' | 'movie' | 'tv'>('all')

const filterOptions = [
  { label: 'search_page.all', value: 'all' },
  { label: 'search_page.movies', value: 'movie' },
  { label: 'search_page.series', value: 'tv' },
]

const query = computed(() => (route.query.query as string) || '')

const fetchSearchResults = async (q: string, page = 1) => {
  if (!q) return
  loaderStore.showLoader()
  try {
    const data = await searchMulti(q, page)
    results.value = data.results.filter((item: MediaItem) => item.poster_path || item.profile_path)
    currentPage.value = data.page
    totalPages.value = data.total_pages
  } finally {
    loaderStore.hideLoader()
  }
}

const filteredResults = computed(() => {
  if (filterType.value === 'all') return results.value
  return results.value.filter((item) => item.media_type === filterType.value)
})

onMounted(() => {
  if (query.value) fetchSearchResults(query.value)
})

watch(
  () => query.value,
  (newQuery) => {
    results.value = []
    if (newQuery) fetchSearchResults(newQuery)
  },
)
watch(
  () => filterType.value,
  () => {
    currentPage.value = 1
    if (query.value) fetchSearchResults(query.value, 1)
  },
)
</script>

<style scoped>
.text-search {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.select {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align-last: center;
  height: 40px;
  width: 60px;
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

@media (min-width: 768px) {
  .select {
    height: 48px;
    width: 90px;
    font-size: 20px;
  }
  .option {
    font-size: 20px;
  }
  .result {
    margin: 15px;
    font-size: 20px;
    text-align: start;
  }
}
@media (min-width: 1024px) {
  .main-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .media-list-wrapper {
    flex: 1;
  }
}
</style>
