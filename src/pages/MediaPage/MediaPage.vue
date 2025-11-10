<template>
  <IBackground>
    <div v-if="media" class="media-page">
      <div class="poster-inf-container">
        <div class="poster-container">
          <p
            v-if="media.vote_average"
            class="rating"
            :style="{ backgroundColor: getRatingColor(Number(media.vote_average)) }"
          >
            {{ media.vote_average }}/10
          </p>
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
            {{ $t('media_page.release') }} {{ media.release_date || media.first_air_date }}
          </p>
          <p v-if="media.runtime">
            {{ $t('media_page.duration') }} {{ media.runtime }} {{ $t('media_page.min') }}
          </p>
          <p v-if="media.episode_run_time?.length">
            {{ $t('media_page.episode_length') }} {{ media.episode_run_time[0] }}
            {{ $t('media_page.min') }}
          </p>
          <p v-if="media.production_countries?.length">
            {{ $t('media_page.countries') }}
            {{ media.production_countries.map((c) => c.name).join(', ') }}
          </p>
          <div v-if="media.genres?.length" class="genres">
            <strong>{{ $t('media_page.genres') }} </strong>
            <span v-for="genre in media.genres" :key="genre.id">{{ genre.name }}</span>
          </div>
          <CollectionButtons :media="media" />
        </div>
      </div>

      <YouTubePlayer v-if="trailerId" :videoId="trailerId" />

      <div class="section" v-if="cast.length">
        <PersonList :people="cast" />
      </div>

      <div class="section" v-if="crew.length">
        <PersonList :people="crew" />
      </div>

      <div class="section" v-if="media.id">
        <ReviewsList :mediaId="media.id" :type="type" />
      </div>
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import IBackground from '@/components/IBackground/IBackground.vue'
import PersonList from './components/PersonList.vue'
import YouTubePlayer from './components/YouTubePlayer.vue'
import ReviewsList from './components/ReviewsList.vue'
import CollectionButtons from './components/CollectionButtons.vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getMediaById, getMediaCredits, getMediaVideos } from '@/api/tmdb'
import { getImageUrl } from '@/utils/getImageUrl'
import { useLanguageStore } from '@/stores/language'
import { getRatingColor } from '@/utils/getColors'
import { useLoaderStore } from '@/stores/loader'

const loader = useLoaderStore()

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
    loader.showLoader()
    media.value = await getMediaById(id, type)
    const credits = await getMediaCredits(id, type)
    cast.value = credits.cast.filter((p: Person) => p.profile_path).slice(0, 15)
    crew.value = credits.crew
      .filter((p: Person) => ['Director', 'Producer', 'Writer', 'Screenplay'].includes(p.job || ''))
      .filter((p: Person) => p.profile_path)
    trailerId.value = await getMediaVideos(id, type)
    loader.hideLoader()
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
  padding: 1px;
  border-radius: 8px;
  background-color: var(--color-red);
  font-size: 20px;
  font-weight: bold;
}
.information {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.poster-inf-container {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  background: var(--color-grey);
  padding: 4px 10px;
  margin-right: 5px;
  border-radius: 5px;
}
.poster {
  border-radius: 10px;
  object-fit: cover;
}
@media (min-width: 1024px) {
  .poster-inf-container {
    flex-direction: row;
    justify-content: center;
    gap: 20px;
  }
}
</style>
