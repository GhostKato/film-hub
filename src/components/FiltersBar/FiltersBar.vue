<template>
  <div class="filter-bar">
    <div class="select-container">
      <ISelect v-model="filterType" :options="typeOptions" />
      <ISelect v-model="genre" :options="genreOptions" />
      <ISelect v-model="rating" :options="ratingOptions" />
      <ISelect v-model="year" :options="yearOptions" />
    </div>

    <div class="position">
      <input
        class="input"
        v-if="isCollectionPage"
        type="text"
        :placeholder="t('filters_bar.placeholder')"
        v-model="query"
      />
      <IButton v-if="query !== ''" variant="small-clean-btn" @click="clearQuery">
        <XIcon />
      </IButton>
    </div>

    <ISelect class="last" v-if="isCollectionPage" v-model="sortType" :options="sortOptions" />
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
  { label: `${t('filters_bar.release')} ↑`, value: 1 as const },
  { label: `${t('filters_bar.release')} ↓`, value: 2 as const },
  { label: `${t('filters_bar.date_added')} ↑`, value: 3 as const },
  { label: `${t('filters_bar.date_added')} ↓`, value: 4 as const },
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
  border: none;
  color: var(--color-white);
  background-color: var(--color-dark-grey);
  padding: 5px 25px 5px 10px;
  width: 100%;
}
.input:focus {
  outline: 1px solid var(--color-red);
}
.input:hover {
  outline: 1px solid var(--color-hover);
}
@media (max-width: 767px) {
  .position {
    width: 100%;
  }
  .filter-bar {
    padding: 0 10px;
  }
}
@media (min-width: 768px) and (max-width: 1279px) {
  .filter-bar {
    width: 100%;
  }
  .last {
    margin-left: auto;
  }
}
@media (min-width: 768px) {
  .filter-bar {
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
