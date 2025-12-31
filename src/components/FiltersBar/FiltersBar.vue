<template>
  <div class="filter-bar">
    <div class="select-container">
      <select class="select" v-model="filterType">
        <option v-if="isCollectionPage" value="all">{{ t('filters_bar.all') }}</option>
        <option value="movie">{{ t('filters_bar.movies') }}</option>
        <option value="tv">{{ t('filters_bar.series') }}</option>
      </select>

      <select class="select" v-model="genre">
        <option value="">{{ t('filters_bar.all_genres') }}</option>
        <option v-for="g in selectedGenres" :key="g.id" :value="g.id">{{ t(g.name) }}</option>
      </select>

      <select class="select" v-model="rating">
        <option value="all">{{ t('filters_bar.all_ratings') }}</option>
        <option value="high">{{ t('filters_bar.ratings') }} 8+</option>
        <option value="medium">{{ t('filters_bar.ratings') }} 5-7</option>
        <option value="low">{{ t('filters_bar.ratings') }} 0-5</option>
      </select>

      <select class="select" v-model="year">
        <option value="">{{ t('filters_bar.all_years') }}</option>
        <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <div class="position">
      <input
        class="input"
        v-if="isCollectionPage"
        type="text"
        :placeholder="t('filters_bar.placeholder')"
        v-model="query"
      />
      <IButton v-if="query !== ''" variant="small-clean-btn" @click="clearQuery"><XIcon /></IButton>
    </div>

    <select class="select last" v-if="isCollectionPage" v-model="sortType">
      <option :value="1">{{ t('filters_bar.release') }} ↑</option>
      <option :value="2">{{ t('filters_bar.release') }} ↓</option>
      <option :value="3">{{ t('filters_bar.date_added') }} ↑</option>
      <option :value="4">{{ t('filters_bar.date_added') }} ↓</option>
      <option :value="5">{{ t('filters_bar.a_to_z') }}</option>
      <option :value="6">{{ t('filters_bar.z_to_a') }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { genres, years } from '@/constants/filtersData'
import { ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import IButton from '../IButton/IButton.vue'
import type { FiltersType } from '@/types/filter'
import XIcon from '../icons/XIcon.vue'

const { t } = useI18n()
const route = useRoute()

const isCollectionPage = route.path == '/collection'

const props = defineProps<{ modelValue: FiltersType }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: FiltersType): void }>()

const filterType = ref(props.modelValue.filterType)
const genre = ref(props.modelValue.genre)
const rating = ref(props.modelValue.rating)
const year = ref(props.modelValue.year)
const sortType = ref<1 | 2 | 3 | 4 | 5 | 6>(props.modelValue.sortType || 1)

const query = ref(props.modelValue.query || '')
const debouncedQuery = ref(props.modelValue.query || '')
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

watch(query, (newVal) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedQuery.value = newVal
  }, 500)
})

const selectedGenres = ref(genres)
const availableYears = ref(years)

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
    sortType: sortType.value,
  })
})

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
})

function clearQuery() {
  if (debounceTimeout) clearTimeout(debounceTimeout)
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
.select {
  height: 27px;
  width: 165px;
  border-radius: 8px;
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
.select option {
  font-size: 16px;
  text-align: center;
  border: none;
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
    padding-left: 10px;
    padding-right: 10px;
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
  .select-container {
    max-width: 100%;
    gap: 10px;
  }
  .select {
    height: auto;
    width: auto;
    padding: 5px;
  }
  .input {
    width: 180px;
  }
}
@media (min-width: 1024px) {
  .select {
    font-size: 20px;
  }
  .select option {
    font-size: 20px;
  }
  .input {
    font-size: 20px;
    width: 260px;
  }
}

@media (min-width: 1280px) {
  .input {
    width: 130px;
  }
}
@media (min-width: 1920px) {
  .input {
    width: 300px;
  }
}
@media (min-width: 2560px) {
  .select {
    height: 43px;
  }
  .input {
    width: 350px;
    height: 43px;
  }
}
</style>
