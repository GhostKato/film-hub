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

  // Saves changes to either Firestore (if the user is logged in) or localStorage.
  const save = async () => {
    if (authStore.user?.uid) {
      await saveMedia(authStore.user.uid, media.value)
    } else {
      localStorage.setItem('media', JSON.stringify(media.value))
    }
  }

  // Adds or removes media to favorites/“view later” by syncing with Firestore or locally.
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

  // The load function loads the user's media:
  // if the user is logged in, it takes data from Firestore, combines it with local (no duplicates), saves the updated list back to Firestore, and clears localStorage;
  // if the user is not logged in, simply pulls up the media from localStorage.
  const load = async () => {
    if (authStore.user?.uid) {
      // 1. Downloading Firestore
      const serverMedia = await loadMedia(authStore.user.uid)

      // 2. Upload local media (if any)
      const localMedia: MediaItem[] = JSON.parse(localStorage.getItem('media') || '[]')

      // 3. Combine while avoiding duplicates
      const merged = [
        ...serverMedia,
        ...localMedia.filter(
          (l) => !serverMedia.some((s) => s.id === l.id && s.media_type === l.media_type),
        ),
      ]

      media.value = merged

      // 4. We store the already combined data on Firestore
      await saveMedia(authStore.user.uid, merged)

      // 5. Cleaning localStorage
      localStorage.removeItem('media')
    } else {
      media.value = JSON.parse(localStorage.getItem('media') || '[]')
    }
  }

  // Clears everything saved (on the server or locally).
  const clear = async () => {
    media.value = []
    if (authStore.user?.uid) await saveMedia(authStore.user.uid, [])
    else localStorage.setItem('media', JSON.stringify([]))
  }
  // Selectors for quick access to the desired lists.
  const favoriteList = () => media.value.filter((m) => m.favorite)
  const watchLaterList = () => media.value.filter((m) => m.watch_later)

  return { media, toggleMedia, favoriteList, watchLaterList, load, clear }
})
