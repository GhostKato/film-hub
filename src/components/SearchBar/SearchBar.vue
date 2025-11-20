<template>
  <div class="search-bar">
    <div class="position">
      <select class="select" v-if="isMultiSearchPage" v-model="useMultiSearch.type">
        <option
          class="option"
          v-for="option in filterOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ t(option.label) }}
        </option>
      </select>
      <input
        :class="['input', isBigSearchBar ? 'big-search-bar' : 'small-search-bar']"
        v-model="useMultiSearch.query"
        @keyup.enter="search"
        type="text"
        :placeholder="t('multi_search_page.placeholder')"
      />
      <IButton
        v-if="useMultiSearch.query"
        :variant="isBigSearchBar ? 'big-clean-btn' : 'small-clean-btn'"
        @click="clearQuery"
        >✖</IButton
      >
    </div>
    <IButton
      :variant="isBigSearchBar ? 'big-search-btn' : 'small-search-btn'"
      :disabled="!useMultiSearch.query.trim()"
      @click="search"
    >
      <template v-if="isBigSearchBar">
        {{ $t('multi_search_page.button') }}
      </template>
      <template v-else>
        <SearchIcon />
      </template>
    </IButton>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IButton from '@/components/IButton/IButton.vue'
import { useMultiSearchStore } from '@/stores/multi-search'
import SearchIcon from '../icons/SearchIcon.vue'

const useMultiSearch = useMultiSearchStore()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const isMultiSearchPage = route.path == '/multi-search'
const isBigSearchBar = route.path === '/multi-search' || route.path === '/'

const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

watch(
  () => useMultiSearch.query,
  (newQuery) => {
    if (!isMultiSearchPage) return

    router.push({
      path: '/multi-search',
      query: newQuery.trim() ? { query: newQuery } : undefined,
    })
  },
  { immediate: true },
)

const search = async () => {
  const q = useMultiSearch.query.trim()
  if (!q) return

  if (!isMultiSearchPage) {
    await router.push({
      path: '/multi-search',
      query: { query: q },
    })
  } else {
    await router.push({
      query: { query: q },
    })
  }

  emit('search', q)
}

const clearQuery = () => {
  useMultiSearch.setQuery('')
}

const filterOptions = [
  { label: 'multi_search_page.all', value: 'all' },
  { label: 'multi_search_page.movies', value: 'movie' },
  { label: 'multi_search_page.series', value: 'tv' },
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
  gap: 5px;
}
.input {
  border-radius: 8px;
  border: none;
  color: var(--color-white);
  background-color: var(--color-dark-grey);
}
.input:focus {
  outline: 1px solid var(--color-red);
}
.input:hover {
  outline: 1px solid var(--color-hover);
}
.big-search-bar {
  padding: 10px 35px 10px 10px;
  width: 220px;
}
.small-search-bar {
  padding: 5px 25px 5px 10px;
  width: 260px;
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
@media (min-width: 768px) {
  .search-bar {
    gap: 10px;
  }
  .position {
    gap: 10px;
  }
  .input {
    font-size: 20px;
  }
  .big-search-bar {
    height: 48px;
    width: 340px;
  }
  .select {
    height: 48px;
    width: 90px;
    font-size: 20px;
  }
  .option {
    font-size: 20px;
  }
}
@media (min-width: 1024px) {
  .big-search-bar {
    width: 700px;
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
