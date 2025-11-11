import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { loadMedia, saveMedia, removeMediaItem, updateMediaItem } from '@/api/firebase'

export interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type: 'movie' | 'tv' | 'person'
  favorite?: boolean
  watch_later?: boolean
}

export const useMediaStore = defineStore('media', () => {
  const media = ref<MediaItem[]>(JSON.parse(localStorage.getItem('media') || '[]'))
  const authStore = useAuthStore()

  const save = async () => {
    if (authStore.user?.uid) {
      await saveMedia(authStore.user.uid, media.value)
    } else {
      localStorage.setItem('media', JSON.stringify(media.value))
    }
  }

  const toggleMedia = async (item: MediaItem, key: 'favorite' | 'watch_later') => {
    const existing = media.value.find((m) => m.id === item.id && m.media_type === item.media_type)

    if (existing) {
      existing[key] = !existing[key]

      // If both false — keys are deleted
      if (!existing.favorite && !existing.watch_later) {
        media.value = media.value.filter(
          (m) => !(m.id === item.id && m.media_type === item.media_type),
        )
        if (authStore.user?.uid) await removeMediaItem(authStore.user.uid, existing)
      } else if (authStore.user?.uid) {
        await updateMediaItem(authStore.user.uid, existing)
      }
    } else {
      const newItem: MediaItem = {
        ...item,
        favorite: key === 'favorite',
        watch_later: key === 'watch_later',
      }
      media.value.push(newItem)
      if (authStore.user?.uid) await updateMediaItem(authStore.user.uid, newItem)
    }

    // Local saving for guests
    if (!authStore.user?.uid) await save()
  }

  const load = async () => {
    if (authStore.user?.uid) {
      media.value = await loadMedia(authStore.user.uid)
    } else {
      media.value = JSON.parse(localStorage.getItem('media') || '[]')
    }
  }

  const clear = async () => {
    media.value = []
    if (authStore.user?.uid) await saveMedia(authStore.user.uid, [])
    else localStorage.setItem('media', JSON.stringify([]))
  }

  const favoriteList = () => media.value.filter((m) => m.favorite)
  const watchLaterList = () => media.value.filter((m) => m.watch_later)

  return { media, toggleMedia, favoriteList, watchLaterList, load, clear }
})
