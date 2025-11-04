<template>
  <IBackground>
    <div v-if="media" class="media-page">
      <div class="poster-container">
        <p class="rating" v-if="media.vote_average">{{ media.vote_average }}/10</p>
        <img
          class="poster"
          v-if="media.poster_path"
          :src="getImageUrl(media.poster_path, 'poster', 'w342')"
          alt="Poster"
        />
      </div>

      <div class="information">
        <h1 class="title">{{ media.title || media.name }}</h1>
        <p class="tagline" v-if="media.tagline">{{ media.tagline }}</p>
        <p class="overview">{{ media.overview }}</p>
        <p class="release-date" v-if="media.release_date || media.first_air_date">
          Release: {{ media.release_date || media.first_air_date }}
        </p>
        <p v-if="media.runtime">Duration: {{ media.runtime }} min</p>
        <p v-if="media.episode_run_time?.length">
          Episode length: {{ media.episode_run_time[0] }} min
        </p>
        <p v-if="media.production_countries?.length">
          Countries: {{ media.production_countries.map((c) => c.name).join(', ') }}
        </p>
        <div v-if="media.genres?.length" class="genres">
          <strong>Genres:</strong>
          <span v-for="genre in media.genres" :key="genre.id">{{ genre.name }}</span>
        </div>
      </div>

      <YouTubePlayer v-if="trailerId" :videoId="trailerId" />

      <div class="section" v-if="cast.length">
        <h2>Actors</h2>
        <PeopleList :people="cast" />
      </div>

      <div class="section" v-if="crew.length">
        <h2>Production Crew</h2>
        <PeopleList :people="crew" />
      </div>

      <div class="section" v-if="media.id">
        <MediaReviews :mediaId="media.id" :type="type" />
      </div>
    </div>

    <div v-else>Loading...</div>
  </IBackground>
</template>

<script setup lang="ts">
import IBackground from '@/components/IBackground/IBackground.vue'
import PeopleList from './components/PeopleList.vue'
import YouTubePlayer from './components/YouTubePlayer.vue'
import MediaReviews from './components/MediaReviews.vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getMediaById, getMediaCredits, getMediaVideos } from '@/api/tmdb'
import { getImageUrl } from '@/utils/getImageUrl'
import { useLanguageStore } from '@/stores/language.'

interface Genre {
  id: number
  name: string
}
interface ProductionCountry {
  name: string
}
interface Media {
  id: number
  title?: string
  name?: string
  overview?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  tagline?: string
  genres?: Genre[]
  production_countries?: ProductionCountry[]
  runtime?: number
  episode_run_time?: number[]
}
interface Person {
  id: number
  name: string
  profile_path?: string
  character?: string
  job?: string
}

const route = useRoute()
const type = route.params.type as 'movie' | 'tv'
const id = Number(route.params.id)

const media = ref<Media | null>(null)
const cast = ref<Person[]>([])
const crew = ref<Person[]>([])
const trailerId = ref<string | null>(null)
const languageStore = useLanguageStore()

const fetchMedia = async () => {
  try {
    media.value = await getMediaById(id, type)

    const credits = await getMediaCredits(id, type)
    cast.value = credits.cast.filter((p: Person) => p.profile_path).slice(0, 15)
    crew.value = credits.crew
      .filter((p: Person) => ['Director', 'Producer', 'Writer', 'Screenplay'].includes(p.job || ''))
      .filter((p: Person) => p.profile_path)

    trailerId.value = await getMediaVideos(id, type)
  } catch (err) {
    console.error('Error fetching media:', err)
  }
}

onMounted(fetchMedia)

watch(
  () => languageStore.lang,
  () => fetchMedia(),
)
</script>

<style scoped>
.media-page {
  padding: 20px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.poster-container {
  position: relative;
}
.rating {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 5px;
  border-radius: 8px;
  background-color: #9f1b19;
  font-size: 20px;
  font-weight: bold;
}
.information {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.title {
  font-size: 2.5rem;
  margin-bottom: 10px;
}
.tagline {
  font-style: italic;
  margin-bottom: 10px;
  color: #ccc;
}
.overview {
  margin: 15px 0;
  font-size: 1.1rem;
}
.genres span {
  background: #444;
  padding: 4px 10px;
  margin-right: 5px;
  border-radius: 5px;
}
.poster {
  border-radius: 10px;
  object-fit: cover;
}
</style>
