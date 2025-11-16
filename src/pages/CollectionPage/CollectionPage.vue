<template>
  <IBackground>
    <div class="collection-page">
      <h1 class="title">{{ $t('collection_page.title') }}</h1>

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
import { useMediaStore } from '@/stores/media'
import { useAuthStore } from '@/stores/auth'
import { useLoaderStore } from '@/stores/loader'
import IButton from '@/components/IButton/IButton.vue'
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
    baseTabs.unshift({
      key: 'recommended',
      label: t('collection_page.recommended'),
    })
  }

  return baseTabs
})

const activeTab = ref<TabKey>(
  (route.query.category as TabKey) ||
    (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID ? 'recommended' : 'favorites'),
)

const changeTab = (tab: TabKey) => {
  activeTab.value = tab
  router.replace({
    query: { category: tab, page: 1 },
  })
}

watch(
  () => route.query.category,
  (newValue) => {
    if (['favorites', 'watch_later', 'recommended'].includes(newValue as string)) {
      activeTab.value = newValue as TabKey
    }
  },
)

watch(
  () => authStore.user,
  async (newUser) => {
    loaderStore.showLoader()
    await mediaStore.load()

    if (newUser?.uid === MAIN_ACCOUNT_ID) {
      router.replace({ query: { category: 'favorites', page: 1 } })
      activeTab.value = 'favorites'
    } else {
      router.replace({ query: { category: 'recommended', page: 1 } })
      activeTab.value = 'recommended'
      await mediaStore.fetchRecommended()
    }

    loaderStore.hideLoader()
  },
)

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

const pageSize = 20

const currentPage = computed({
  get: () => Number(route.query.page) || 1,
  set: (value: number) => {
    router.replace({ query: { ...route.query, page: value } })
  },
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return currentData.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(currentData.value.length / pageSize))

watch(
  () => route.query.page,
  (newVal) => {
    currentPage.value = Number(newVal) || 1
  },
)

watch(
  () => mediaStore.media,
  () => {
    loaderStore.showLoader()
    setTimeout(() => loaderStore.hideLoader(), 200)
  },
  { deep: true },
)

onMounted(async () => {
  if (!route.query.category || !route.query.page) {
    router.replace({
      path: route.path,
      query: {
        category: activeTab.value,
        page: 1,
      },
    })
  }

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

.title {
  font-weight: bold;
  text-shadow: 0 0 15px var(--color-shadow);
  margin: 0;
  margin-bottom: 10px;
}

.tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

@media (min-width: 768px) {
  .collection-page {
    display: block;
  }
  .tabs {
    padding-left: 20px;
  }
  .title {
    padding-left: 20px;
    font-size: 40px;
  }
  .tabs {
    gap: 10px;
  }
}
</style>
