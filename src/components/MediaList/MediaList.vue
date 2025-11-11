<template>
  <div class="media-list">
    <div v-if="!itemsWithPoster.length && !loader.loading && routePath !== '/search'" class="empty">
      <p>{{ $t('media_list.not_found') }}</p>
    </div>

    <div v-else class="media-grid">
      <div
        v-for="item in itemsWithPoster"
        :key="item.id"
        class="media-card"
        @click="goToMedia(item)"
      >
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

        <img
          :src="getImageUrl(item.poster_path, 'poster', 'w500')"
          :alt="item.title || item.name"
        />

        <div class="info">
          <h3>{{ item.title || item.name }}</h3>
          <p class="type">
            {{
              item.media_type === 'tv' || (!item.media_type && isSeriesRoute)
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
import { useLoaderStore } from '@/stores/loader'

const loader = useLoaderStore()

interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path?: string
  media_type?: 'movie' | 'tv' | 'person'
  first_air_date?: string
  vote_average?: number
  release_date?: string
}

const props = defineProps<{
  items: MediaItem[]
  routePath?: string
}>()

const router = useRouter()
const routeSeries = useRoute()

const itemsWithPoster = computed(() => props.items.filter((item) => item.poster_path))
const isSeriesRoute = routeSeries.path.includes('/series') || routeSeries.name === 'series'

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
  padding: 20px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.media-card {
  position: relative;
  background: var(--color-transparent);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.release {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px;
  border-radius: 8px;
  font-size: 15px;
}

.rating {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px;
  border-radius: 8px;
  font-size: 15px;
}

.media-card:hover {
  transform: scale(1.05);
}

.media-card img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}

.info {
  padding: 10px;
  text-align: center;
  color: var(--color-white);
}

h3 {
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
</style>
