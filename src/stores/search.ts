import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    type: 'all' as 'all' | 'movie' | 'tv',
    notification: false,
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
    showNotification() {
      this.notification = true
    },
    hideNotification() {
      this.notification = false
    },
  },
})
