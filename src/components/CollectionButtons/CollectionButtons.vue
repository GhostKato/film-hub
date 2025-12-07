<template>
  <div class="big-btn-container" v-if="isMediaPage">
    <IButton variant="big-btn-collection" @click="toggleFavorite(media)">
      {{
        isFavorite(media.id) ? $t('media_page.remove_favorites') : $t('media_page.add_favorites')
      }}
    </IButton>

    <IButton variant="big-btn-collection" @click="toggleWatchLater(media)">
      {{
        isWatchLater(media.id)
          ? $t('media_page.remove_watch_later')
          : $t('media_page.add_watch_later')
      }}
    </IButton>
  </div>

  <div class="small-btn-container" v-else>
    <div class="small-btn-item">
      <IButton variant="small-btn-collection" @click.stop="toggleFavorite(media)">
        <FavoriteIcon :class="{ active: isFavorite(media.id) }" />
      </IButton>
    </div>

    <div class="small-btn-item">
      <IButton variant="small-btn-collection" @click.stop="toggleWatchLater(media)">
        <WatchLaterIcon :class="{ active: isWatchLater(media.id) }" />
      </IButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaStore } from '@/stores/media'
import IButton from '@/components/IButton/IButton.vue'
import FavoriteIcon from '../icons/FavoriteIcon.vue'
import WatchLaterIcon from '../icons/WatchLaterIcon.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import type { FirebaseItemType } from '@/types/media'

const { media } = defineProps<{ media: FirebaseItemType }>()

const mediaStore = useMediaStore()

const route = useRoute()
const currentType = computed<'movie' | 'tv'>(() => {
  return route.path.startsWith('/series') ? 'tv' : 'movie'
})

const isMediaPage = computed(() => route.name === 'media')

const typeToCheck = media.media_type ?? currentType.value

const isFavorite = (id: number) => {
  return mediaStore.favoriteList().some((item) => item.id === id && item.media_type === typeToCheck)
}

const isWatchLater = (id: number) => {
  return mediaStore
    .watchLaterList()
    .some((item) => item.id === id && item.media_type === typeToCheck)
}

const toggleFavorite = (item: FirebaseItemType) => {
  const docData = {
    ...item,
    media_type: item.media_type ?? currentType.value,
  }
  mediaStore.toggleMedia(docData, 'favorite')
}

const toggleWatchLater = (item: FirebaseItemType) => {
  const docData = {
    ...item,
    media_type: item.media_type ?? currentType.value,
  }
  mediaStore.toggleMedia(docData, 'watch_later')
}
</script>

<style scoped>
.big-btn-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}
.small-btn-container {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.small-btn-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.small-btn-item svg {
  color: var(--color-white);
  transition: color 0.3s ease;
}

.small-btn-item svg.active {
  color: var(--color-red);
}
.small-btn-item:hover svg {
  color: var(--color-hover);
}
@media (min-width: 768px) {
  .big-btn-container {
    justify-content: flex-start;
  }
}
</style>
