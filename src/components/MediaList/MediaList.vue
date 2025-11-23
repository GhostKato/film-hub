<template>
  <div class="media-list">
    <div
      v-if="!itemsWithPoster.length && searchStore.isSearched && !searchStore.query"
      class="empty"
    >
      <p>{{ $t('media_list.not_found') }}</p>
    </div>

    <div v-else class="media-grid">
      <div
        v-for="item in itemsWithPoster"
        :key="item.id"
        class="media-card"
        @click="goToMedia(item)"
      >
        <div class="release-vote-container">
          <p
            v-if="item.release_date || item.first_air_date"
            class="release"
            :style="{
              backgroundColor: getReleaseColor((item.release_date ?? item.first_air_date) || ''),
            }"
          >
            {{ item.release_date || item.first_air_date }}
          </p>

          <p
            v-if="item.vote_average"
            class="rating"
            :style="{ backgroundColor: getRatingColor(Number(item.vote_average)) }"
          >
            {{ item.vote_average }}
          </p>
        </div>
        <CollectionIndicator v-if="!routePerson.path.startsWith('/person')" :media="item" />

        <img
          :src="getImageUrl(item.poster_path, 'poster', 'w500')"
          :alt="item.title || item.name"
        />

        <div class="info">
          <h3 class="title">{{ truncateTitle(item.title ?? item.name ?? '') }}</h3>
          <p class="type">
            {{
              item.media_type === 'tv' || (!item.media_type && item.name && !item.title)
                ? $t('media_list.type_series')
                : $t('media_list.type_movie')
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { getImageUrl } from '@/utils/getImageUrl'
import { getRatingColor, getReleaseColor } from '@/utils/getColors'
import CollectionIndicator from './CollectionIndicator.vue'
import { truncateTitle } from '@/utils/truncateTitle'
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()

export interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path?: string
  media_type: 'movie' | 'tv' | 'person'
  first_air_date?: string
  vote_average?: number
  release_date?: string
}

const props = defineProps<{
  items: MediaItem[]
  routePath?: string
}>()

const router = useRouter()
const routePerson = useRoute()
const itemsWithPoster = computed(() => props.items.filter((item) => item.poster_path))

const goToMedia = (item: MediaItem) => {
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie')
  router.push({
    name: 'media',
    params: { type, id: item.id },
  })
}
</script>

<style scoped>
.media-list {
  padding: 10px;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.media-card {
  aspect-ratio: 9 / 17;
  position: relative;
  background: var(--color-transparent);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.media-card img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}
.release-vote-container {
  position: absolute;
  top: 3px;
  left: 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.release {
  padding: 3px;
  border-radius: 8px;
  font-size: 15px;
}
.rating {
  padding: 3px;
  border-radius: 8px;
  font-size: 15px;
  margin-right: auto;
}
.info {
  padding: 5px;
  text-align: center;
  color: var(--color-white);
}
.title {
  font-size: 16px;
  margin-bottom: 5px;
}
.type {
  font-size: 14px;
  opacity: 0.8;
}
.empty {
  text-align: center;
  color: var(--color-white);
  margin-top: 40px;
}
@media (min-width: 640px) {
  .media-card {
    aspect-ratio: 9 / 16;
  }
}
@media (min-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .media-card {
    aspect-ratio: 9 / 17;
  }
  .empty {
    font-size: 20px;
  }
}
@media (min-width: 1024px) {
  .media-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .media-card {
    aspect-ratio: 9 / 16;
  }
}
@media (min-width: 1280px) {
  .media-card {
    aspect-ratio: 9 / 16;
  }
}
@media (min-width: 1920px) {
  .media-grid {
    grid-template-columns: repeat(10, 1fr);
  }
  .media-card {
    aspect-ratio: 9 / 17;
    transition: transform 0.3s ease;
  }
  .media-card:hover {
    transform: scale(1.05);
    z-index: 10;
  }
}
@media (min-width: 2560px) {
  .media-grid {
    gap: 30px 10px;
  }
}
</style>
