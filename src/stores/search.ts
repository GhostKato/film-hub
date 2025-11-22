import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    type: 'all' as 'all' | 'movie' | 'tv',
    isSearched: false,
  }),

  actions: {
    setQuery(value: string) {
      this.query = value
    },
    clearQuery() {
      this.query = ''
    },
    setType(value: 'all' | 'movie' | 'tv') {
      this.type = value
    },
    startSearch() {
      this.isSearched = true
    },
    finishSearch() {
      this.isSearched = false
    },
  },
})
