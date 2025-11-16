<template>
  <IBackground>
    <div v-if="media" class="media-page">
      <div class="all-info">
        <div class="info-main">
          <div class="poster-cont">
            <img
              class="poster"
              v-if="media.poster_path"
              :src="getImageUrl(media.poster_path, 'poster', 'w342')"
              alt="Poster"
            />
          </div>

          <div class="info-cont">
            <h1 class="title">{{ media.title || media.name }}</h1>
            <p class="tagline" v-if="media.tagline">{{ media.tagline }}</p>
            <p class="overview">{{ media.overview }}</p>

            <div class="info-item" v-if="media.vote_average">
              <strong>Rating:</strong>
              <p
                class="rating"
                :style="{ backgroundColor: getRatingColor(Number(media.vote_average)) }"
              >
                {{ media.vote_average }}/10
              </p>
            </div>

            <div class="info-item" v-if="media.release_date || media.first_air_date">
              <strong>{{ $t('media_page.release') }}</strong>
              <p
                class="release"
                :style="{
                  backgroundColor: getReleaseColor(
                    (media.release_date ?? media.first_air_date) || '',
                  ),
                }"
              >
                {{ media.release_date || media.first_air_date }}
              </p>
            </div>

            <div class="info-item" v-if="media.runtime">
              <strong>{{ $t('media_page.duration') }}</strong>
              <p>{{ media.runtime }} {{ $t('media_page.min') }}</p>
            </div>

            <div class="info-item" v-if="media.episode_run_time?.length">
              <strong>{{ $t('media_page.episode_length') }}</strong>
              <p>{{ media.episode_run_time[0] }} {{ $t('media_page.min') }}</p>
            </div>

            <div class="info-item" v-if="media.production_countries?.length">
              <strong>{{ $t('media_page.countries') }}</strong>
              <p>{{ media.production_countries.map((c) => c.name).join(', ') }}</p>
            </div>

            <div class="info-item" v-if="media.genres?.length">
              <strong>{{ $t('media_page.genres') }} </strong>
              <div class="genres">
                <span v-for="genre in media.genres" :key="genre.id">{{ genre.name }}</span>
              </div>
            </div>
            <CollectionButtons :media="{ ...media, media_type: type }" />
            <ShareButton :title="media.title ?? media.name ?? ''" />
          </div>
        </div>
        <YouTubePlayer v-if="trailerId" :videoId="trailerId" />
      </div>

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
import { getRatingColor, getReleaseColor } from '@/utils/getColors'
import { useLoaderStore } from '@/stores/loader'
import ShareButton from './components/ShareButton.vue'

const loaderStore = useLoaderStore()

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
    loaderStore.showLoader()
    media.value = await getMediaById(id, type)
    const credits = await getMediaCredits(id, type)
    cast.value = credits.cast.filter((p: Person) => p.profile_path).slice(0, 15)
    crew.value = credits.crew
      .filter((p: Person) => ['Director', 'Producer', 'Writer', 'Screenplay'].includes(p.job || ''))
      .filter((p: Person) => p.profile_path)
    trailerId.value = await getMediaVideos(id, type)
    loaderStore.hideLoader()
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
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
}
.all-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.info-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.rating,
.release {
  padding: 3px 5px;
  border-radius: 8px;
}
.poster-cont {
  display: flex;
  justify-content: center;
}
.poster {
  border-radius: 8px;
  object-fit: cover;
  display: flex;
  justify-content: center;
}
.info-cont {
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
  color: var(--color-light-grey);
}
.overview {
  margin: 15px 0;
  font-size: 1.1rem;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.genres span {
  background: var(--color-grey);
  padding: 4px 10px;
  margin-right: 5px;
  border-radius: 8px;
}
@media (min-width: 1024px) {
  .info-main {
    flex-direction: row;
    justify-content: center;
  }
}
@media (min-width: 1920px) {
  .all-info {
    display: flex;
    flex-direction: row;
  }
}
</style>
