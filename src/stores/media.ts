import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMediaById } from '@/api/tmdb'

export interface MediaItem {
  id: number
  type: 'movie' | 'tv'
  pinned?: boolean
}
export interface MediaData extends MediaItem {
  title?: string
  name?: string
  poster_path?: string
  [key: string]: unknown
}

export const useMediaStore = defineStore('media', () => {
  const myCollection = ref<MediaItem[]>(JSON.parse(localStorage.getItem('myCollection') || '[]'))
  const watchLater = ref<MediaItem[]>(JSON.parse(localStorage.getItem('watchLater') || '[]'))

  const save = (listName: 'myCollection' | 'watchLater') => {
    const list = listName === 'myCollection' ? myCollection.value : watchLater.value
    localStorage.setItem(listName, JSON.stringify(list))
  }
  const addItem = (listName: 'myCollection' | 'watchLater', item: MediaItem) => {
    const list = listName === 'myCollection' ? myCollection.value : watchLater.value
    const existing = list.find((i) => i.id === item.id && i.type === item.type)
    if (!existing) {
      list.push(item)
    } else {
      existing.pinned = item.pinned ?? existing.pinned
    }
    save(listName)
  }

  const removeItem = (listName: 'myCollection' | 'watchLater', id: number) => {
    const list = listName === 'myCollection' ? myCollection.value : watchLater.value
    const index = list.findIndex((i) => i.id === id)
    if (index !== -1) list.splice(index, 1)
    save(listName)
  }
  const togglePin = (listName: 'myCollection' | 'watchLater', item: MediaData) => {
    const list = listName === 'myCollection' ? myCollection.value : watchLater.value

    if (!list || list.length === 0) {
      console.warn(`List ${listName} is empty, adding item with pinned = true`)
      list.push({ ...item, pinned: true })
      save(listName)
      return
    }

    const existing = list.find((i) => i.id === item.id)
    if (!existing) {
      console.log(`Item not found in ${listName}, adding it with pinned = true`)
      list.push({ ...item, pinned: true })
    } else {
      existing.pinned = !existing.pinned
      console.log(`Toggled pin for item ${item.id}:`, existing.pinned)
    }

    save(listName)
  }

  const getListData = async (listName: 'myCollection' | 'watchLater'): Promise<MediaData[]> => {
    const list = listName === 'myCollection' ? myCollection.value : watchLater.value
    const promises = list.map((item) => getMediaById(item.id, item.type))
    const data = await Promise.all(promises)

    return data.map((media, i) => ({
      ...media,
      pinned: list[i]?.pinned || false,
      type: list[i]?.type ?? 'movie',
    }))
  }

  return { myCollection, watchLater, addItem, removeItem, togglePin, getListData }
})
