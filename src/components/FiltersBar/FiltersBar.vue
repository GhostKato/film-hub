<template>
  <div class="select-container">
    <select class="select" v-model="filterType">
      <option v-if="isCollectionPage" value="all">All</option>
      <option value="movie">{{ t('filters_bar.movies') }}</option>
      <option value="tv">{{ t('filters_bar.series') }}</option>
    </select>

    <select class="select" v-model="genre">
      <option value="">{{ t('filters_bar.all_genres') }}</option>
      <option v-for="g in genres" :key="g.id" :value="g.id">{{ t(g.name) }}</option>
    </select>

    <select class="select" v-model="rating">
      <option value="all">{{ t('filters_bar.all_ratings') }}</option>
      <option value="high">{{ t('filters_bar.ratings') }} 8+</option>
      <option value="medium">{{ t('filters_bar.ratings') }} 5-7</option>
      <option value="low">{{ t('filters_bar.ratings') }} 0-5</option>
    </select>

    <select class="select" v-model="year">
      <option value="">{{ t('filters_bar.all_years') }}</option>
      <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
    </select>

    <input
      class="input"
      v-if="isCollectionPage"
      type="text"
      :placeholder="t('filters_bar.placeholder')"
      v-model="query"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

const isCollectionPage = route.path == '/collection'

export interface FiltersType {
  filterType: 'movie' | 'tv' | 'all'
  genre: string
  rating: 'all' | 'low' | 'medium' | 'high'
  year: string
  query?: string
}

const props = defineProps<{ modelValue: FiltersType }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: FiltersType): void }>()

const filterType = ref<'movie' | 'tv' | 'all'>(props.modelValue.filterType)
const genre = ref<string>(props.modelValue.genre)
const rating = ref<'all' | 'low' | 'medium' | 'high'>(props.modelValue.rating)
const year = ref<string>(props.modelValue.year)
const query = ref<string>(props.modelValue.query || '')

const genres = ref([
  { id: 28, name: 'filters_bar.action' },
  { id: 35, name: 'filters_bar.comedy' },
  { id: 10751, name: 'filters_bar.family' },
  { id: 12, name: 'filters_bar.adventure' },
  { id: 14, name: 'filters_bar.fantasy' },
  { id: 99, name: 'filters_bar.documentary' },
  { id: 18, name: 'filters_bar.drama' },
  { id: 36, name: 'filters_bar.history' },
  { id: 80, name: 'filters_bar.crime' },
  { id: 9648, name: 'filters_bar.mystery' },
  { id: 27, name: 'filters_bar.horror' },
  { id: 53, name: 'filters_bar.thriller' },
  { id: 10752, name: 'filters_bar.war' },
  { id: 37, name: 'filters_bar.western' },
  { id: 10749, name: 'filters_bar.romance' },
  { id: 16, name: 'filters_bar.animation' },
])

const years = ref<number[]>([
  2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013,
  2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997,
  1996, 1995, 1994, 1993, 1992, 1991, 1990, 1989, 1988, 1987, 1986, 1985, 1984, 1983, 1982, 1981,
  1980,
])

watch(
  () => props.modelValue,
  (val) => {
    filterType.value = val.filterType
    genre.value = val.genre
    rating.value = val.rating
    year.value = val.year
    query.value = val.query || ''
  },
  { deep: true, immediate: true },
)

watch([filterType, genre, rating, year, query], () => {
  emit('update:modelValue', {
    filterType: filterType.value,
    genre: genre.value,
    rating: rating.value,
    year: year.value,
    query: query.value,
  })
})
</script>

<style scoped>
.select-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 400px;
}
.select {
  height: 27px;
  width: 170px;
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
  width: 200px;
}
.input:focus {
  outline: 1px solid var(--color-red);
}
.input:hover {
  outline: 1px solid var(--color-hover);
}
@media (min-width: 768px) {
  .select-container {
    justify-content: flex-start;
    max-width: 100%;
    gap: 10px;
  }
  .select {
    height: auto;
    width: auto;
    padding: 5px 10px;
    font-size: 20px;
  }
  .select option {
    font-size: 20px;
  }
  .input {
    font-size: 20px;
  }
}

@media (min-width: 1280px) {
  .input {
    width: 200px;
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
  }
}
</style>
