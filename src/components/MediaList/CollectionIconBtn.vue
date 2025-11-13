<template>
  <div class="btn-container">
    <IButton variant="collection-icon-btn" @click.stop="toggleFavorite(media)">
      <FavoriteIcon :fill="isFavorite(media.id) ? '#ff0000' : '#ffffff'" />
    </IButton>
    <IButton variant="collection-icon-btn" @click.stop="toggleWatchLater(media)">
      <WatchLaterIcon :fill="isWatchLater(media.id) ? '#ff0000' : '#ffffff'" />
    </IButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaStore, type MediaItem } from '@/stores/media'
import IButton from '@/components/IButton/IButton.vue'
import FavoriteIcon from '../icons/FavoriteIcon.vue'
import WatchLaterIcon from '../icons/WatchLaterIcon.vue'

const { media } = defineProps<{ media: MediaItem }>()
const route = useRoute()
const mediaStore = useMediaStore()

const currentType = computed<'movie' | 'tv'>(() => {
  const type = route.params.type
  return type === 'tv' ? 'tv' : 'movie'
})
const isFavorite = (id: number) => {
  return mediaStore.favoriteList().some((item) => item.id === id)
}
const isWatchLater = (id: number) => {
  return mediaStore.watchLaterList().some((item) => item.id === id)
}
const toggleFavorite = (item: MediaItem) => {
  mediaStore.toggleMedia({ ...item, media_type: currentType.value }, 'favorite')
}
const toggleWatchLater = (item: MediaItem) => {
  mediaStore.toggleMedia({ ...item, media_type: currentType.value }, 'watch_later')
}
</script>

<style scoped>
.btn-container {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
</style>
