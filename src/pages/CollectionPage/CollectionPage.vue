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

      <MediaList :items="currentData" />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
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
  router.replace({
    query: {
      category: tab,
    },
  })
}

watch(
  () => route.query.category,
  (newValue) => {
    if (newValue === 'favorites' || newValue === 'watch_later' || newValue === 'recommended') {
      activeTab.value = newValue
    }
  },
)

onMounted(async () => {
  if (!route.query.category) {
    router.replace({ path: route.path, query: { category: 'recommended' } })
  }

  loaderStore.showLoader()
  await mediaStore.load()
  if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
    await mediaStore.fetchRecommended()
  }
  loaderStore.hideLoader()
})

watch(
  () => authStore.user,
  async () => {
    loaderStore.showLoader()
    await mediaStore.load()
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

watch(
  () => mediaStore.media,
  () => {
    loaderStore.showLoader()
    setTimeout(() => loaderStore.hideLoader(), 200)
  },
  { deep: true },
)
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
