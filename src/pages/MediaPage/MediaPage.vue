<template>
  <IBackground>
    <div v-if="media" class="media-page">
      <!-- Заголовок і базова інформація -->
      <h1>{{ media.title || media.name }}</h1>
      <p class="tagline" v-if="media.tagline">{{ media.tagline }}</p>
      <p class="overview">{{ media.overview }}</p>
      <p class="release-date" v-if="media.release_date || media.first_air_date">
        Release: {{ media.release_date || media.first_air_date }}
      </p>
      <p v-if="media.vote_average">Rating: {{ media.vote_average }}/10</p>

      <!-- Картинки -->
      <div class="images">
        <img
          v-if="media.poster_path"
          :src="getImageUrl(media.poster_path, 'poster')"
          alt="Poster"
        />
        <img
          v-if="media.backdrop_path"
          :src="getImageUrl(media.backdrop_path, 'backdrop')"
          alt="Backdrop"
        />
      </div>

      <!-- Жанри -->
      <div v-if="media.genres?.length" class="genres">
        <strong>Genres:</strong>
        <span v-for="genre in media.genres" :key="genre.id">{{ genre.name }}</span>
      </div>

      <!-- Додаткова інформація -->
      <div class="extra-info">
        <p v-if="media.runtime">Duration: {{ media.runtime }} min</p>
        <p v-if="media.episode_run_time?.length">
          Episode length: {{ media.episode_run_time[0] }} min
        </p>
        <p v-if="media.production_countries?.length">
          Countries: {{ media.production_countries.map((c) => c.name).join(', ') }}
        </p>
      </div>
    </div>

    <div v-else>Loading...</div>
  </IBackground>
</template>

<script setup lang="ts">
import IBackground from '@/components/IBackground/IBackground.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMediaById } from '../../api/tmdb'

interface Media {
  [key: string]: any
}

const route = useRoute()
const type = route.params.type as 'movie' | 'tv'
const id = Number(route.params.id)

const media = ref<Media | null>(null)

const BASE_URL = 'https://image.tmdb.org/t/p/'
const IMAGE_SIZES: Record<string, string[]> = {
  poster: ['w500', 'original'],
  backdrop: ['w780', 'original'],
}
const getImageUrl = (path: string, type: string = 'poster', size?: string) => {
  if (!path) return ''
  const sizes = IMAGE_SIZES[type]
  const selectedSize = size && sizes.includes(size) ? size : sizes[0]
  return `${BASE_URL}${selectedSize}${path}`
}

onMounted(async () => {
  try {
    media.value = await getMediaById(id, type)
  } catch (err) {
    console.error(err)
  }
})
</script>

<style scoped>
.media-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  color: #fff;
}
.media-page h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}
.overview {
  margin: 15px 0;
  font-size: 1.1rem;
}
.images {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}
.images img {
  border-radius: 10px;
  max-width: 100%;
  object-fit: cover;
}
.genres span {
  background: #444;
  padding: 4px 10px;
  margin-right: 5px;
  border-radius: 5px;
}
.extra-info p {
  margin: 5px 0;
}
</style>
