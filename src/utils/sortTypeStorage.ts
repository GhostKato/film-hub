import type { FiltersType } from '@/types/filter'

const SORT_TYPE_KEY = 'collection_sort_type'

export function getSortTypeFromLS(): FiltersType['sortType'] {
  const saved = localStorage.getItem(SORT_TYPE_KEY)
  const num = Number(saved)

  if (num >= 1 && num <= 6) {
    return num as FiltersType['sortType']
  }

  return 1
}

export function saveSortTypeToLS(value: FiltersType['sortType']) {
  localStorage.setItem(SORT_TYPE_KEY, String(value))
}
