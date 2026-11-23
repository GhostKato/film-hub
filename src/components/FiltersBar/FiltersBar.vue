<template>
  <div class="filter-bar" :class="{ 'is-collection': isCollectionPage }">
    <div class="select-container">
      <ISelect v-model="filterType" :options="typeOptions" />
      <ISelect v-model="genre" :options="genreOptions" />
      <ISelect v-model="rating" :options="ratingOptions" />
      <ISelect v-model="year" :options="yearOptions" />
    </div>

    <div v-if="isCollectionPage" class="collection-controls">
      <div class="position">
        <input
          class="input"
          type="text"
          :placeholder="t('filters_bar.placeholder')"
          v-model="query"
        />
        <IButton v-if="query !== ''" variant="small-clean-btn" @click="clearQuery">
          <XIcon />
        </IButton>
      </div>

      <ISelect class="last" v-model="sortType" :options="sortOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { genres, years } from '@/constants/filtersData'
import type { FiltersType } from '@/types/filter'

import IButton from '../IButton/IButton.vue'
import ISelect from '../ISelect/ISelect.vue'
import XIcon from '../icons/XIcon.vue'

const { t } = useI18n()
const route = useRoute()
const isCollectionPage = route.path === '/collection'

const props = defineProps<{ modelValue: FiltersType }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: FiltersType): void }>()

const filterType = ref(props.modelValue.filterType)
const genre = ref(props.modelValue.genre)
const rating = ref(props.modelValue.rating)
const year = ref(props.modelValue.year)
const sortType = ref(props.modelValue.sortType || 1)
const query = ref(props.modelValue.query || '')
const debouncedQuery = ref(props.modelValue.query || '')

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const typeOptions = computed(() => {
  const opts: { label: string; value: 'all' | 'movie' | 'tv' }[] = [
    { label: t('filters_bar.movies'), value: 'movie' },
    { label: t('filters_bar.series'), value: 'tv' },
  ]
  if (isCollectionPage) opts.unshift({ label: t('filters_bar.all'), value: 'all' })
  return opts
})

const genreOptions = computed(() => [
  { label: t('filters_bar.all_genres'), value: '' },
  ...genres.map((g) => ({ label: t(g.name), value: String(g.id) })),
])

const ratingOptions = computed(() => [
  { label: t('filters_bar.all_ratings'), value: 'all' as const },
  { label: `${t('filters_bar.ratings')} 8+`, value: 'high' as const },
  { label: `${t('filters_bar.ratings')} 5-7`, value: 'medium' as const },
  { label: `${t('filters_bar.ratings')} 0-5`, value: 'low' as const },
])

const yearOptions = computed(() => [
  { label: t('filters_bar.all_years'), value: '' },
  ...years.map((y) => ({ label: String(y), value: String(y) })),
])

const sortOptions = computed(() => [
  { label: `${t('filters_bar.release')} ▲`, value: 1 as const },
  { label: `${t('filters_bar.release')} ▼`, value: 2 as const },
  { label: `${t('filters_bar.date_added')} ▲`, value: 3 as const },
  { label: `${t('filters_bar.date_added')} ▼`, value: 4 as const },
  { label: t('filters_bar.a_to_z'), value: 5 as const },
  { label: t('filters_bar.z_to_a'), value: 6 as const },
])

watch(query, (newVal) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedQuery.value = newVal
  }, 500)
})

watch(
  () => props.modelValue,
  (val) => {
    filterType.value = val.filterType
    genre.value = val.genre
    rating.value = val.rating
    year.value = val.year
    sortType.value = val.sortType || 1
    query.value = val.query || ''
    debouncedQuery.value = val.query || ''
  },
  { deep: true },
)

watch([filterType, genre, rating, year, debouncedQuery, sortType], () => {
  emit('update:modelValue', {
    filterType: filterType.value,
    genre: genre.value,
    rating: rating.value,
    year: year.value,
    query: debouncedQuery.value,
    sortType: sortType.value as 1 | 2 | 3 | 4 | 5 | 6,
  })
})

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
})

function clearQuery() {
  query.value = ''
  debouncedQuery.value = ''
}
</script>
<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.collection-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.position {
  position: relative;
}
.select-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
.input {
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  background-color: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  height: 34px;
  padding: 0 25px 0 10px;
  width: 100%;
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
@media (max-width: 767px) {
  .filter-bar:not(.is-collection) {
    width: 100%;
  }
  .filter-bar:not(.is-collection) .select-container {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .filter-bar:not(.is-collection) .select-container :deep(.custom-select) {
    width: 100%;
  }
}
@media (max-width: 814px) {
  .filter-bar.is-collection {
    width: 100%;
  }
  .filter-bar.is-collection .select-container {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .filter-bar.is-collection .select-container :deep(.custom-select) {
    width: 100%;
  }
  .filter-bar.is-collection .collection-controls {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .filter-bar.is-collection .position {
    width: 100%;
    min-width: 0;
  }
  .filter-bar.is-collection .last {
    width: 100%;
    min-width: 0;
  }
  .filter-bar.is-collection .last :deep(.select-trigger) {
    width: 100%;
    padding: 0 10px;
    white-space: nowrap;
  }
  .filter-bar.is-collection .last :deep(.options-dropdown) {
    left: auto;
    right: 0;
    min-width: 100%;
    width: max-content;
  }
}
@media (min-width: 768px) {
  .filter-bar:not(.is-collection) {
    flex-direction: row;
  }
}
@media (min-width: 815px) and (max-width: 1499px) {
  .filter-bar.is-collection {
    width: 100%;
  }
  .filter-bar.is-collection .collection-controls {
    flex: 1;
  }
  .filter-bar.is-collection .last {
    margin-left: auto;
  }
}
@media (min-width: 815px) {
  .filter-bar.is-collection {
    flex-direction: row;
  }
  .input {
    width: 175px;
  }
  .last {
    margin-left: auto;
  }
}
@media (min-width: 1024px) {
  .input {
    font-size: 20px;
    height: 36px;
    width: 240px;
  }
}
@media (min-width: 2560px) {
  .input {
    width: 260px;
    height: 43px;
  }
}
</style>
