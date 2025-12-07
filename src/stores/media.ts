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
import { MAIN_ACCOUNT_ID } from '@/constants/env'
import type { FirebaseItemType } from '@/types/media'

type TmdbLikeItem = FirebaseItemType & {
  genres?: { id: number }[]
}
const normalizeGenres = (item: TmdbLikeItem): number[] => {
  if (Array.isArray(item.genre_ids)) return item.genre_ids
  if (Array.isArray(item.genres)) return item.genres.map((g) => g.id)
  return []
}
const sanitizeForDb = (item: unknown): FirebaseItemType => {
  const i = item as Partial<FirebaseItemType>

  const clean: FirebaseItemType = {
    id: i.id!,
    media_type: i.media_type!,
    title: i.title,
    name: i.name,
    poster_path: i.poster_path,
    release_date: i.release_date,
    first_air_date: i.first_air_date,
    vote_average: i.vote_average,
    favorite: i.favorite,
    watch_later: i.watch_later,
    genre_ids: i.genre_ids,
  }

  Object.keys(clean).forEach((key) => {
    if (clean[key as keyof FirebaseItemType] === undefined) {
      delete clean[key as keyof FirebaseItemType]
    }
  })
  return clean
}

export const useMediaStore = defineStore('media', () => {
  const media = ref<FirebaseItemType[]>(JSON.parse(localStorage.getItem('media') || '[]'))
  const recommended = ref<FirebaseItemType[]>([])
  const authStore = useAuthStore()

  const save = async () => {
    if (authStore.user?.uid) {
      const clean = media.value.map(sanitizeForDb)
      await saveMedia(authStore.user.uid, clean)
    } else {
      localStorage.setItem('media', JSON.stringify(media.value))
    }
  }
  const updateRecommended = async () => {
    if (authStore.user?.uid !== MAIN_ACCOUNT_ID) return

    const list = media.value.filter((item) => item.favorite)
    const clean = list.map(sanitizeForDb)

    await saveRecommended(clean)
    recommended.value = clean
  }
  const toggleMedia = async (item: TmdbLikeItem, key: 'favorite' | 'watch_later') => {
    const existing = media.value.find((m) => m.id === item.id && m.media_type === item.media_type)

    if (existing) {
      existing[key] = !existing[key]
      existing.genre_ids = normalizeGenres(item)

      if (!existing.favorite && !existing.watch_later) {
        media.value = media.value.filter(
          (m) => !(m.id === item.id && m.media_type === item.media_type),
        )

        if (authStore.user?.uid) {
          await removeMediaItem(authStore.user.uid, sanitizeForDb(existing))
        }
      } else if (authStore.user?.uid) {
        await updateMediaItem(authStore.user.uid, sanitizeForDb(existing))
      }
    } else {
      const newItem: FirebaseItemType = sanitizeForDb({
        ...item,
        favorite: key === 'favorite',
        watch_later: key === 'watch_later',
        genre_ids: normalizeGenres(item),
      })

      media.value.push(newItem)

      if (authStore.user?.uid) {
        await updateMediaItem(authStore.user.uid, newItem)
      }
    }

    if (authStore.user?.uid === MAIN_ACCOUNT_ID) {
      await updateRecommended()
    }

    if (!authStore.user?.uid) {
      await save()
    }
  }
  const load = async () => {
    if (authStore.user?.uid) {
      const serverMedia: FirebaseItemType[] = (await loadMedia(authStore.user.uid)).map(
        sanitizeForDb,
      )

      const localMedia: FirebaseItemType[] = JSON.parse(localStorage.getItem('media') || '[]').map(
        sanitizeForDb,
      )

      const merged: FirebaseItemType[] = [
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
      const stored: FirebaseItemType[] = JSON.parse(localStorage.getItem('media') || '[]').map(
        sanitizeForDb,
      )

      media.value = stored
    }

    const rec = await loadRecommended()
    recommended.value = rec.map(sanitizeForDb)
  }

  const clear = async () => {
    media.value = []

    if (authStore.user?.uid) {
      await saveMedia(authStore.user.uid, [])

      if (authStore.user?.uid === MAIN_ACCOUNT_ID) {
        await updateRecommended()
      }
    } else {
      localStorage.setItem('media', '[]')
    }
  }
  const fetchRecommended = async () => {
    const rec = await loadRecommended()
    recommended.value = rec.map(sanitizeForDb)
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
