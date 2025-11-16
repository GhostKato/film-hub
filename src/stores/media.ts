import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import {
  loadMedia,
  saveMedia,
  removeMediaItem,
  updateMediaItem,
  saveRecommended,
  loadRecommended,
} from '@/api/firebase'
import { MAIN_ACCOUNT_ID } from '@/constants'

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

  const recommended = ref<MediaItem[]>([])

  const authStore = useAuthStore()

  const save = async () => {
    if (authStore.user?.uid) {
      await saveMedia(authStore.user.uid, media.value)
    } else {
      localStorage.setItem('media', JSON.stringify(media.value))
    }
  }

  const updateRecommended = async () => {
    if (authStore.user?.uid !== MAIN_ACCOUNT_ID) return

    const list = media.value.filter((item) => item.favorite)

    await saveRecommended(list)

    recommended.value = list
  }
  const toggleMedia = async (item: MediaItem, key: 'favorite' | 'watch_later') => {
    const existing = media.value.find((m) => m.id === item.id && m.media_type === item.media_type)

    if (existing) {
      existing[key] = !existing[key]

      if (!existing.favorite && !existing.watch_later) {
        media.value = media.value.filter(
          (m) => !(m.id === item.id && m.media_type === item.media_type),
        )
        if (authStore.user?.uid) await removeMediaItem(authStore.user.uid, existing)
      } else if (authStore.user?.uid) {
        await updateMediaItem(authStore.user.uid, existing)
      }
    } else {
      const newItem = {
        ...item,
        favorite: key === 'favorite',
        watch_later: key === 'watch_later',
      }
      media.value.push(newItem)

      if (authStore.user?.uid) await updateMediaItem(authStore.user.uid, newItem)
    }

    if (authStore.user?.uid === MAIN_ACCOUNT_ID) {
      await updateRecommended()
    }

    if (!authStore.user?.uid) await save()
  }

  const load = async () => {
    if (authStore.user?.uid) {
      const serverMedia = await loadMedia(authStore.user.uid)
      const localMedia: MediaItem[] = JSON.parse(localStorage.getItem('media') || '[]')

      const merged = [
        ...serverMedia,
        ...localMedia.filter(
          (l) => !serverMedia.some((s) => s.id === l.id && s.media_type === l.media_type),
        ),
      ]

      media.value = merged
      await saveMedia(authStore.user.uid, merged)
      localStorage.removeItem('media')

      if (authStore.user?.uid === MAIN_ACCOUNT_ID) {
        await updateRecommended()
      }
    } else {
      media.value = JSON.parse(localStorage.getItem('media') || '[]')
    }

    recommended.value = await loadRecommended()
  }
  const clear = async () => {
    media.value = []

    if (authStore.user?.uid) {
      await saveMedia(authStore.user.uid, [])

      if (authStore.user?.uid === MAIN_ACCOUNT_ID) {
        await updateRecommended()
      }
    } else {
      localStorage.setItem('media', JSON.stringify([]))
    }
  }

  const fetchRecommended = async () => {
    recommended.value = await loadRecommended()
  }

  const favoriteList = () => media.value.filter((m) => m.favorite)
  const watchLaterList = () => media.value.filter((m) => m.watch_later)
  const recommendedList = () => recommended.value

  return {
    media,
    recommended,
    toggleMedia,
    favoriteList,
    watchLaterList,
    recommendedList,
    load,
    clear,
    updateRecommended,
    fetchRecommended,
  }
})
