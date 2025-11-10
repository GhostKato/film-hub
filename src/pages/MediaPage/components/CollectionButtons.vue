<template>
  <div class="top-actions">
    <IButton variant="collection-btn" @click="toggleCollection(media, 'myCollection')">
      {{
        isInCollection(media.id, 'myCollection')
          ? $t('media_page.remove_collection')
          : $t('media_page.add_collection')
      }}
    </IButton>

    <IButton variant="collection-btn" @click="toggleCollection(media, 'watchLater')">
      {{
        isInCollection(media.id, 'watchLater')
          ? $t('media_page.remove_watch_later')
          : $t('media_page.add_watch_later')
      }}
    </IButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaStore } from '@/stores/media'
import IButton from '@/components/IButton/IButton.vue'

interface MediaData {
  id: number
  title?: string
  name?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

const { media } = defineProps<{ media: MediaData }>()

const route = useRoute()
const mediaStore = useMediaStore()

const currentType = computed<'movie' | 'tv'>(() => {
  const type = route.params.type
  return type === 'tv' ? 'tv' : 'movie'
})

const isInCollection = (id: number, listName: 'myCollection' | 'watchLater') => {
  return mediaStore[listName].some((item) => item.id === id)
}

const toggleCollection = (item: MediaData, listName: 'myCollection' | 'watchLater') => {
  if (isInCollection(item.id, listName)) {
    mediaStore.removeItem(listName, item.id)
  } else {
    mediaStore.addItem(listName, {
      id: item.id,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      media_type: currentType.value,
    })
  }
}
</script>

<style scoped>
.top-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
