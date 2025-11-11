<template>
  <IBackground>
    <div class="collection-page">
      <h1 class="title">{{ $t('collection_page.title') }}</h1>

      <div class="tabs">
        <button :class="{ active: activeTab === 'favorite' }" @click="changeTab('favorite')">
          {{ $t('collection_page.favorites') }}
        </button>
        <button :class="{ active: activeTab === 'watch_later' }" @click="changeTab('watch_later')">
          {{ $t('collection_page.watch_later') }}
        </button>
      </div>

      <MediaList :items="currentData" />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import { useMediaStore } from '@/stores/media'
import { useAuthStore } from '@/stores/auth'
import { useLoaderStore } from '@/stores/loader'

const mediaStore = useMediaStore()
const auth = useAuthStore()
const loader = useLoaderStore()

const activeTab = ref<'favorite' | 'watch_later'>('favorite')

onMounted(async () => {
  loader.showLoader()
  await mediaStore.load()
  loader.hideLoader()
})

watch(
  () => auth.user,
  async () => {
    loader.showLoader()
    await mediaStore.load()
    loader.hideLoader()
  },
)

const currentData = computed(() => {
  return activeTab.value === 'favorite' ? mediaStore.favoriteList() : mediaStore.watchLaterList()
})

const changeTab = (tab: 'favorite' | 'watch_later') => {
  activeTab.value = tab
}

watch(
  () => mediaStore.media,
  () => {
    loader.showLoader()
    setTimeout(() => {
      loader.hideLoader()
    }, 200)
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
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.tabs button {
  padding: 5px 5px;
  border: none;
  border-radius: 8px;
  background: var(--color-dark-grey);
  color: var(--color-white);
  cursor: pointer;
  transition: 0.3s;
}

.tabs button.active {
  background: var(--color-red);
  color: var(--color-white);
}

.tabs button:hover {
  background: var(--color-hover);
}

.loading-more {
  text-align: center;
  margin-top: 20px;
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

  .tabs button {
    padding: 10px 15px;
  }
}
</style>
