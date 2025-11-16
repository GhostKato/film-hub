<template>
  <div class="indicator-container">
    <div class="indicator-item" v-if="isFavorite(media.id)">
      <FavoriteIcon />
    </div>
    <div class="indicator-item" v-if="isWatchLater(media.id)">
      <WatchLaterIcon />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaStore, type MediaItem } from '@/stores/media'
import FavoriteIcon from '../icons/FavoriteIcon.vue'
import WatchLaterIcon from '../icons/WatchLaterIcon.vue'

const { media } = defineProps<{ media: MediaItem }>()

const mediaStore = useMediaStore()

const isFavorite = (id: number) => {
  return mediaStore.favoriteList().some((item) => item.id === id)
}
const isWatchLater = (id: number) => {
  return mediaStore.watchLaterList().some((item) => item.id === id)
}
</script>

<style scoped>
.indicator-container {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.indicator-item {
  background-color: var(--color-transparent-black);
  border: none;
  border-radius: 50%;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
