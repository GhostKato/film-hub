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
        class="input"
        v-model="useMultiSearch.query"
        @keyup.enter="search"
        type="text"
        :placeholder="t('multi_search_page.placeholder')"
      />
      <IButton v-if="useMultiSearch.query" variant="clear-btn" @click="clearQuery">✖</IButton>
    </div>
    <IButton variant="search-btn" :disabled="!useMultiSearch.query.trim()" @click="search">{{
      $t('multi_search_page.button')
    }}</IButton>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IButton from '@/components/IButton/IButton.vue'
import { useMultiSearchStore } from '@/stores/multi-search'

const useMultiSearch = useMultiSearchStore()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const isMultiSearchPage = route.path == '/multi-search'
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
  padding: 10px 35px 10px 10px;
  border-radius: 8px;
  border: none;
  width: 220px;
  color: var(--color-white);
  background-color: var(--color-dark-grey);
}

.input:focus {
  outline: 1px solid var(--color-red);
}

.input:hover {
  outline: 1px solid var(--color-hover);
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
    height: 48px;
    width: 340px;
    font-size: 20px;
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
  .input {
    width: 700px;
  }
}
</style>
