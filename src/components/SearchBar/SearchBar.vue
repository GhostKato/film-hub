<template>
  <div class="search-bar">
    <div class="position">
      <ISelect
        v-if="isMultiSearchPage"
        class="search-type-select"
        v-model="searchStore.type"
        :options="filterOptions"
      />

      <input
        :class="['input', isBigSearchBar ? 'big-search-bar' : 'small-search-bar']"
        v-model="searchStore.query"
        @keyup.enter="search"
        type="text"
        :placeholder="t('search_bar.placeholder')"
      />

      <IButton
        v-if="searchStore.query"
        :variant="isBigSearchBar ? 'big-clean-btn' : 'small-clean-btn'"
        @click="clearSearch"
      >
        <XIcon />
      </IButton>
    </div>

    <IButton
      :variant="isBigSearchBar ? 'big-search-btn' : 'small-search-btn'"
      :disabled="!searchStore.query.trim()"
      @click="search"
    >
      <template v-if="isBigSearchBar">
        {{ $t('search_bar.button') }}
      </template>
      <template v-else>
        <SearchIcon />
      </template>
    </IButton>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IButton from '@/components/IButton/IButton.vue'
import { useSearchStore } from '@/stores/search'
import SearchIcon from '../icons/SearchIcon.vue'
import XIcon from '../icons/XIcon.vue'
import ISelect from '../ISelect/ISelect.vue'

const searchStore = useSearchStore()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const isMultiSearchPage = route.path === '/multi-search'
const isBigSearchBar = route.path === '/multi-search' || route.path === '/'

const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

const search = async () => {
  const q = searchStore.query.trim()
  if (!q) return

  await router.push({
    path: '/multi-search',
    query: { query: q },
  })

  emit('search', q)
}

onMounted(() => {
  const queryFromUrl = route.query.query as string
  if (isMultiSearchPage && queryFromUrl) {
    searchStore.query = queryFromUrl
    emit('search', queryFromUrl)
  }
})

function clearSearch() {
  searchStore.clearQuery()
  searchStore.hideNotification()
}

const filterOptions = [
  { label: t('search_bar.all'), value: 'all' },
  { label: t('search_bar.movies'), value: 'movie' },
  { label: t('search_bar.series'), value: 'tv' },
]
</script>

<style scoped>
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.position {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 5px;
}
.search-type-select {
  width: 95px;
  min-width: 95px;
  flex-shrink: 0;
}
.search-type-select :deep(.select-trigger) {
  width: 100%;
  height: 39px;
  padding: 0 10px;
}
.input {
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  background-color: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.65),
    0 4px 8px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    box-shadow 0.25s ease,
    border-color 0.2s ease,
    background-color 0.25s ease;
}
.input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}
.input:hover {
  border-color: var(--color-hover);
  background-color: var(--glass-modal);
  box-shadow:
    0 16px 30px rgba(0, 0, 0, 0.8),
    0 6px 12px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.input:focus {
  outline: none;
  border-color: var(--color-red);
  background-color: var(--glass-modal);
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.85),
    0 0 14px rgba(159, 27, 25, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.big-search-bar {
  height: 39px;
  padding: 10px 35px 10px 10px;
  width: 200px;
}
.small-search-bar {
  height: 34px;
  padding: 5px 30px 5px 10px;
  width: 312px;
}
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
  width: 70px;
  border-radius: 8px;
  font-size: 16px;
  color: var(--color-white);
  background-color: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid var(--glass-border);
  outline: none;
  appearance: none;
  cursor: pointer;
}
.select:hover {
  border-color: var(--color-hover);
}
.option {
  font-size: 16px;
  text-align: center;
  border: none;
}
.option:checked {
  background-color: var(--color-red);
}
@media (max-width: 767px) {
  .search-bar:has(.small-search-bar) {
    width: 100%;
  }
  .search-bar:has(.small-search-bar) .position {
    flex: 1;
    min-width: 0;
  }
  .small-search-bar {
    width: 100%;
    flex: 1;
    min-width: 0;
  }
}
@media (min-width: 768px) {
  .search-bar {
    gap: 10px;
  }
  .position {
    gap: 10px;
  }
  .search-type-select :deep(.select-trigger) {
    height: 48px;
    padding: 0 12px;
  }
  .big-search-bar {
    height: 48px;
    width: 340px;
  }
  .small-search-bar {
    height: auto;
    width: 200px;
  }
  .select {
    height: 48px;
    width: 90px;
  }
}
@media (min-width: 1024px) {
  .search-type-select {
    width: 115px;
    min-width: 115px;
  }
  .input {
    font-size: 20px;
  }
  .big-search-bar {
    width: 700px;
  }
  .small-search-bar {
    width: 250px;
  }
  .select {
    font-size: 20px;
  }
  .option {
    font-size: 20px;
  }
}
@media (min-width: 1920px) {
  .small-search-bar {
    width: 300px;
  }
}
@media (min-width: 2560px) {
  .small-search-bar {
    height: 43px;
    width: 400px;
  }
}
</style>
