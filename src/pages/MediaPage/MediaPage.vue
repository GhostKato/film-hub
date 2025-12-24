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
            <MediaInfo :item="media" />
          </div>

          <div class="info-cont">
            <h1 class="title">{{ media.title || media.name }}</h1>
            <p class="tagline" v-if="media.tagline">{{ media.tagline }}</p>
            <p class="overview">{{ media.overview }}</p>

            <div class="info-item" v-if="studios.length">
              <strong>{{ $t('media_page.studio') }}</strong>
              <p>
                <span v-for="(studio, index) in studios" :key="studio.id">
                  {{ studio.name }}
                  <span v-if="index < studios.length - 1">, </span>
                </span>
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
import CollectionButtons from '../../components/CollectionButtons/CollectionButtons.vue'
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getMediaById, getMediaCredits, getMediaVideos } from '@/api/tmdb'
import { getImageUrl } from '@/utils/getImageUrl'
import { useLanguageStore } from '@/stores/language'
import { useLoaderStore } from '@/stores/loader'
import ShareButton from './components/ShareButton.vue'
import type { PersonItemType } from '@/types/person'
import type { TmdbMediaType } from '@/types/media'
import MediaInfo from '@/components/MediaInfo/MediaInfo.vue'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'

const loaderStore = useLoaderStore()

const route = useRoute()
const type = route.params.type as 'movie' | 'tv'
const id = Number(route.params.id)

const media = ref<TmdbMediaType | null>(null)
const cast = ref<PersonItemType[]>([])
const crew = ref<PersonItemType[]>([])
const trailerId = ref<string | null>(null)
const languageStore = useLanguageStore()
const { t } = useI18n()

const studios = computed(() => {
  return media.value?.production_companies ?? []
})

const fetchMedia = async () => {
  try {
    loaderStore.showLoader()
    media.value = await getMediaById(id, type)
    const credits = await getMediaCredits(id, type)
    cast.value = credits.cast.filter((p: PersonItemType) => p.profile_path).slice(0, 15)
    crew.value = credits.crew
      .filter((p: PersonItemType) =>
        ['Director', 'Producer', 'Writer', 'Screenplay'].includes(p.job || ''),
      )
      .filter((p: PersonItemType) => p.profile_path)
    trailerId.value = await getMediaVideos(id, type)
  } catch {
    notificationStore.error(t('notification_message.media_error'))
  } finally {
    loaderStore.hideLoader()
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
.poster-cont {
  display: flex;
  justify-content: center;
  position: relative;
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
