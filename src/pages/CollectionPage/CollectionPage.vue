<template>
  <IBackground>
    <div class="collection-page">
      <h1 class="title">{{ $t('collection_page.title') }}</h1>

      <div class="tabs">
        <button
          :class="{ active: activeTab === 'myCollection' }"
          @click="changeTab('myCollection')"
        >
          {{ $t('collection_page.my_collection') }}
        </button>
        <button :class="{ active: activeTab === 'watchLater' }" @click="changeTab('watchLater')">
          {{ $t('collection_page.watch_later') }}
        </button>
      </div>

      <MediaList :items="currentData" :loading="loading" />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import { useMediaStore } from '@/stores/media'

const mediaStore = useMediaStore()

const activeTab = ref<'myCollection' | 'watchLater'>('myCollection')
const loading = ref(false)

const currentData = computed(() =>
  activeTab.value === 'myCollection' ? mediaStore.myCollection : mediaStore.watchLater,
)
const changeTab = (tab: 'myCollection' | 'watchLater') => {
  activeTab.value = tab
}

watch(
  [() => mediaStore.myCollection, () => mediaStore.watchLater],
  () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
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
