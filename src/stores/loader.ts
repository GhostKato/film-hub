import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoaderStore = defineStore('loader', () => {
  const loading = ref(false)

  function showLoader() {
    loading.value = true
  }

  function hideLoader() {
    loading.value = false
  }

  return { loading, showLoader, hideLoader }
})
