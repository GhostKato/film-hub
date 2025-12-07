<template>
  <div class="btn-container">
    <IButton variant="collection-btn" @click="toggleFavorite(media)">
      {{
        isFavorite(media.id) ? $t('media_page.remove_favorites') : $t('media_page.add_favorites')
      }}
    </IButton>

    <IButton variant="collection-btn" @click="toggleWatchLater(media)">
      {{
        isWatchLater(media.id)
          ? $t('media_page.remove_watch_later')
          : $t('media_page.add_watch_later')
      }}
    </IButton>
  </div>
</template>

<script setup lang="ts">
import { useMediaStore } from '@/stores/media'
import IButton from '@/components/IButton/IButton.vue'
import type { FirebaseItemType } from '@/types/media'

const { media } = defineProps<{ media: FirebaseItemType }>()

const mediaStore = useMediaStore()

const isFavorite = (id: number) => {
  return mediaStore
    .favoriteList()
    .some((item) => item.id === id && item.media_type === media.media_type)
}
const isWatchLater = (id: number) => {
  return mediaStore
    .watchLaterList()
    .some((item) => item.id === id && item.media_type === media.media_type)
}
const toggleFavorite = (item: FirebaseItemType) => {
  mediaStore.toggleMedia({ ...item, media_type: media.media_type }, 'favorite')
}
const toggleWatchLater = (item: FirebaseItemType) => {
  mediaStore.toggleMedia({ ...item, media_type: media.media_type }, 'watch_later')
}
</script>

<style scoped>
.btn-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}
@media (min-width: 768px) {
  .btn-container {
    justify-content: flex-start;
  }
}
</style>
