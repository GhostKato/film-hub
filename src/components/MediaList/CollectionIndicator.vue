<template>
  <div class="indicator-container">
    <div class="indicator-item">
      <IButton variant="indicator-btn" @click.stop="toggleFavorite(media)">
        <FavoriteIcon :class="{ active: isFavorite(media.id) }" />
      </IButton>
    </div>

    <div class="indicator-item">
      <IButton variant="indicator-btn" @click.stop="toggleWatchLater(media)">
        <WatchLaterIcon :class="{ active: isWatchLater(media.id) }" />
      </IButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaStore } from '@/stores/media'
import type { MediaItem } from '@/stores/media'
import IButton from '@/components/IButton/IButton.vue'
import FavoriteIcon from '../icons/FavoriteIcon.vue'
import WatchLaterIcon from '../icons/WatchLaterIcon.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const { media } = defineProps<{ media: MediaItem }>()
const mediaStore = useMediaStore()

const route = useRoute()
const currentType = computed<'movie' | 'tv'>(() => {
  return route.path.startsWith('/series') ? 'tv' : 'movie'
})

const typeToCheck = media.media_type ?? currentType.value

const isFavorite = (id: number) => {
  return mediaStore.favoriteList().some((item) => item.id === id && item.media_type === typeToCheck)
}

const isWatchLater = (id: number) => {
  return mediaStore
    .watchLaterList()
    .some((item) => item.id === id && item.media_type === typeToCheck)
}

const toggleFavorite = (item: MediaItem) => {
  const docData = {
    ...item,
    media_type: item.media_type ?? currentType.value,
  }
  mediaStore.toggleMedia(docData, 'favorite')
}

const toggleWatchLater = (item: MediaItem) => {
  const docData = {
    ...item,
    media_type: item.media_type ?? currentType.value,
  }
  mediaStore.toggleMedia(docData, 'watch_later')
}
</script>

<style scoped>
.indicator-container {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.indicator-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.indicator-item svg {
  color: var(--color-white);
  transition: color 0.3s ease;
}

.indicator-item svg.active {
  color: var(--color-red);
}
.indicator-item:hover svg {
  color: var(--color-hover);
}
</style>
