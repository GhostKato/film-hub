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
import { notificationStore } from './notifications'
import { i18n } from '@/i18n'

type TmdbLikeItem = FirebaseItemType & {
  genres?: { id: number }[]
}

const normalizeGenres = (item: TmdbLikeItem): number[] => {
  if (Array.isArray(item.genre_ids)) return item.genre_ids
  if (Array.isArray(item.genres)) return item.genres.map((g) => g.id)
  return []
}

const isReleaseToday = (item: FirebaseItemType) => {
  const today = new Date()
  const releaseDate = new Date(item.release_date || item.first_air_date || '')
  return releaseDate.toDateString() === today.toDateString()
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
    release: i.release ?? false,
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
    const uid = authStore.user?.uid
    const isMain = uid === MAIN_ACCOUNT_ID

    const existing = media.value.find((m) => m.id === item.id && m.media_type === item.media_type)

    if (existing) {
      const newValue = !existing[key]

      existing[key] = newValue
      existing.genre_ids = normalizeGenres(item)

      if (!existing.favorite && !existing.watch_later) {
        media.value = media.value.filter(
          (m) => !(m.id === item.id && m.media_type === item.media_type),
        )

        if (uid) {
          await removeMediaItem(uid, sanitizeForDb(existing))
        }

        if (isMain) {
          await updateRecommended()
        }

        notificationStore.removed(
          i18n.global.t(
            key === 'favorite'
              ? 'notification_message.removed_favorite_success'
              : 'notification_message.removed_watch_later_success',
          ),
        )
        return
      }

      if (uid) {
        await updateMediaItem(uid, sanitizeForDb(existing))
      }

      if (isMain && key === 'favorite') {
        await updateRecommended()
      }

      if (newValue) {
        notificationStore.added(
          i18n.global.t(
            key === 'favorite'
              ? 'notification_message.added_favorite_success'
              : 'notification_message.added_watch_later_success',
          ),
        )
      } else {
        notificationStore.removed(
          i18n.global.t(
            key === 'favorite'
              ? 'notification_message.removed_favorite_success'
              : 'notification_message.removed_watch_later_success',
          ),
        )
      }

      return
    }

    const newItem: FirebaseItemType = sanitizeForDb({
      ...item,
      favorite: key === 'favorite',
      watch_later: key === 'watch_later',
      genre_ids: normalizeGenres(item),
      release: isReleaseToday(item),
    })

    media.value.push(newItem)

    if (uid) {
      await updateMediaItem(uid, newItem)
    }

    if (isMain && key === 'favorite') {
      await updateRecommended()
    }

    notificationStore.added(
      i18n.global.t(
        key === 'favorite'
          ? 'notification_message.added_favorite_success'
          : 'notification_message.added_watch_later_success',
      ),
    )

    if (!uid) {
      await save()
    }
  }

  const load = async () => {
    const uid = authStore.user?.uid

    if (uid) {
      const serverMedia: FirebaseItemType[] = (await loadMedia(uid)).map(sanitizeForDb)
      const localMedia: FirebaseItemType[] = JSON.parse(localStorage.getItem('media') || '[]').map(
        sanitizeForDb,
      )

      const merged: FirebaseItemType[] = [
        ...serverMedia,
        ...localMedia.filter(
          (l) => !serverMedia.some((s) => s.id === l.id && s.media_type === l.media_type),
        ),
      ]

      media.value = merged.map((m) => ({
        ...m,
        release: m.release || isReleaseToday(m),
      }))

      await saveMedia(uid, media.value)
      localStorage.removeItem('media')

      if (uid === MAIN_ACCOUNT_ID) {
        await updateRecommended()
      }
    } else {
      const stored: FirebaseItemType[] = JSON.parse(localStorage.getItem('media') || '[]').map(
        sanitizeForDb,
      )

      media.value = stored.map((m) => ({
        ...m,
        release: m.release || isReleaseToday(m),
      }))
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

  const removeRelease = async (item: FirebaseItemType) => {
    const existing = media.value.find((m) => m.id === item.id && m.media_type === item.media_type)
    if (existing) {
      existing.release = false
      await save()
    }
  }

  const removeAllRelease = async () => {
    media.value.forEach((m) => (m.release = false))

    if (authStore.user?.uid) {
      await saveMedia(authStore.user.uid, media.value)
      if (authStore.user?.uid === MAIN_ACCOUNT_ID) {
        await updateRecommended()
      }
    } else {
      localStorage.setItem('media', JSON.stringify(media.value))
    }
  }

  const favoriteList = () => media.value.filter((m) => m.favorite)
  const watchLaterList = () => media.value.filter((m) => m.watch_later)
  const recommendedList = () => recommended.value
  const releaseList = () => media.value.filter((m) => m.release)

  return {
    media,
    recommended,
    toggleMedia,
    favoriteList,
    watchLaterList,
    recommendedList,
    releaseList,
    load,
    clear,
    removeRelease,
    removeAllRelease,
    updateRecommended,
    fetchRecommended,
  }
})
