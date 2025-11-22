<template>
  <IBackground>
    <div class="collection-page">
      <h1 class="title">{{ $t('collection_page.title') }}</h1>

      <div class="header-page">
        <div class="tabs">
          <IButton
            v-for="tab in tabs"
            :key="tab.key"
            variant="categories-btn"
            :class="{ active: activeTab === tab.key }"
            @click="changeTab(tab.key)"
          >
            {{ tab.label }}
          </IButton>
        </div>

        <div class="filter-bar-container">
          <FiltersBar v-model="filters" />
        </div>
      </div>

      <MediaList :items="paginatedData" />

      <IPagination
        v-if="totalPages > 1"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:page="(p) => (currentPage = p)"
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
import type { FiltersType } from '@/components/FiltersBar/FiltersBar.vue'
import { useMediaStore } from '@/stores/media'
import { useAuthStore } from '@/stores/auth'
import { useLoaderStore } from '@/stores/loader'
import { useI18n } from 'vue-i18n'
import { MAIN_ACCOUNT_ID } from '@/constants'

const mediaStore = useMediaStore()
const authStore = useAuthStore()
const loaderStore = useLoaderStore()
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

const activeTab = ref<TabKey>(
  (route.query.category as TabKey) ||
    (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID ? 'recommended' : 'favorites'),
)

const changeTab = (tab: TabKey) => {
  activeTab.value = tab
  router.replace({ query: { category: tab, page: 1 } })
}

const filters = ref<FiltersType>({
  filterType: 'all',
  genre: '',
  rating: 'all',
  year: '',
  query: '',
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

    if (filters.value.rating !== 'all') {
      const vote = item.vote_average || 0
      if (filters.value.rating === 'low' && vote > 5) return false
      if (filters.value.rating === 'medium' && (vote < 5 || vote > 8)) return false
      if (filters.value.rating === 'high' && vote < 8) return false
    }

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

const pageSize = 20
const currentPage = ref(Number(route.query.page) || 1)

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

watch(
  () => route.query.page,
  (newVal) => {
    currentPage.value = Number(newVal) || 1
  },
)

watch(
  () => filteredData.value,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = 1
  },
)

watch(
  () => authStore.user,
  async () => {
    loaderStore.showLoader()
    await mediaStore.load()
    if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
      await mediaStore.fetchRecommended()
    }
    loaderStore.hideLoader()
  },
)

onMounted(async () => {
  loaderStore.showLoader()
  await mediaStore.load()
  if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
    await mediaStore.fetchRecommended()
  }
  loaderStore.hideLoader()
})
</script>

<style scoped>
.collection-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
}
.header-page {
  margin-bottom: 5px;
}
.title {
  font-weight: bold;
  text-shadow: 0 0 15px var(--color-shadow);
  margin: 0;
  margin-bottom: 10px;
}
.tabs {
  display: flex;
  align-items: center;
  gap: 5px;
}
.filter-bar-container {
  display: none;
}
@media (min-width: 768px) {
  .collection-page {
    display: block;
  }
  .header-page {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 20px;
    padding-right: 20px;
  }
  .title {
    padding-left: 20px;
    font-size: 40px;
  }
  .tabs {
    gap: 10px;
  }

  @media (min-width: 1280px) {
    .filter-bar-container {
      display: block;
    }
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
