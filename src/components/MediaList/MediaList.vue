<template>
  <div class="media-list">
    <div v-if="!itemsWithPoster.length && !loading && routePath !== '/search/multi'" class="empty">
      <p>Нічого не знайдено 😢</p>
    </div>

    <div v-else-if="loading" class="loading">
      <p>Завантаження...</p>
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
          <p class="type">{{ item.media_type === 'tv' ? 'Серіал' : 'Фільм' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { defineProps, computed } from 'vue'
import { getImageUrl } from '@/utils/getImageUrl'
import { getRatingColor, getReleaseColor } from '@/utils/getColors'

interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path?: string
  media_type?: 'movie' | 'tv' | 'person'
  first_air_date?: string
  vote_average?: string
  release_date?: string
}

const props = defineProps<{
  items: MediaItem[]
  loading?: boolean
  routePath?: string
}>()

const router = useRouter()

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
  padding: 20px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.media-card {
  position: relative;
  background: var(--background-card);
  border-radius: 12px;
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

.empty,
.loading {
  text-align: center;
  color: var(--color-white);
  margin-top: 40px;
}
</style>
