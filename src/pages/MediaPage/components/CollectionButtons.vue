<template>
  <div class="top-actions">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaStore, type MediaItem } from '@/stores/media'
import IButton from '@/components/IButton/IButton.vue'

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
.top-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
