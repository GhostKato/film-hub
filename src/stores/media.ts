import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type: 'movie' | 'tv' | 'person'
  pinned?: boolean
}

export const useMediaStore = defineStore('media', () => {
  const myCollection = ref<MediaItem[]>(JSON.parse(localStorage.getItem('myCollection') || '[]'))
  const watchLater = ref<MediaItem[]>(JSON.parse(localStorage.getItem('watchLater') || '[]'))

  const save = (name: 'myCollection' | 'watchLater') => {
    const list = name === 'myCollection' ? myCollection.value : watchLater.value
    localStorage.setItem(name, JSON.stringify(list))
  }

  const addItem = (name: 'myCollection' | 'watchLater', item: MediaItem) => {
    const list = name === 'myCollection' ? myCollection.value : watchLater.value
    if (!list.find((i) => i.id === item.id && i.media_type === item.media_type)) {
      list.push(item)
      save(name)
    }
  }

  const removeItem = (name: 'myCollection' | 'watchLater', id: number) => {
    const list = name === 'myCollection' ? myCollection.value : watchLater.value
    const index = list.findIndex((i) => i.id === id)
    if (index !== -1) {
      list.splice(index, 1)
      save(name)
    }
  }

  return {
    myCollection,
    watchLater,
    addItem,
    removeItem,
  }
})
