<template>
  <div class="trending-slider" :class="{ visible: visibilityTrendingSlider }">
    <Swiper
      v-if="moviesWithPoster.length"
      :modules="[Autoplay, EffectCoverflow]"
      effect="coverflow"
      :coverflow-effect="{
        rotate: 0,
        stretch: 18,
        depth: 170,
        modifier: 1.35,
        slideShadows: false,
      }"
      :centered-slides="true"
      :slides-per-view="3"
      :speed="800"
      :loop="moviesWithPoster.length > maxSlidesPerView"
      :loop-additional-slides="4"
      :autoplay="{ delay: 2200, disableOnInteraction: false }"
      class="mySwiper"
      :breakpoints="breakpoints"
    >
      <SwiperSlide v-for="movie in moviesWithPoster" :key="`${movie.media_type}_${movie.id}`">
        <router-link :to="`/media/${movie.media_type}/${movie.id}`" class="slide-link">
          <img
            :src="getImageUrl(movie.poster_path, 'poster', 'w500')"
            :alt="movie.title || movie.name"
            class="poster"
          />
        </router-link>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'

import { getTrendingAllDay } from '@/api/tmdb'
import { getImageUrl } from '@/utils/getImageUrl'
import { useLanguageStore } from '@/stores/language'
import { useLoaderStore } from '@/stores/loader'
import type { SliderType } from '@/types/slider'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'

const loaderStore = useLoaderStore()
const { t } = useI18n()

const breakpoints = {
  375: { slidesPerView: 3 },
  768: { slidesPerView: 7 },
  1024: { slidesPerView: 9 },
  1920: { slidesPerView: 13 },
  2560: { slidesPerView: 17 },
}

const maxSlidesPerView = computed(() => {
  const values = Object.values(breakpoints).map((b) => b.slidesPerView)
  return Math.max(...values)
})

interface Props {
  visibilityTrendingSlider: boolean
}

const { visibilityTrendingSlider } = defineProps<Props>()

const movies = ref<SliderType[]>([])

const moviesWithPoster = computed(() => {
  const seen = new Set<string>()
  return movies.value.filter((m) => {
    if (!m.poster_path) return false
    const uid = `${m.media_type}_${m.id}`
    if (seen.has(uid)) return false
    seen.add(uid)
    return true
  })
})

const fetchTrending = async () => {
  const allResults: SliderType[] = []
  try {
    loaderStore.showLoader()
    for (let page = 1; page <= 3; page++) {
      const data = await getTrendingAllDay(page)
      allResults.push(...data.results)
    }
    movies.value = allResults
  } catch {
    notificationStore.error(t('notification_message.slider_data_error'))
  } finally {
    loaderStore.hideLoader()
  }
}

const languageStore = useLanguageStore()

watch(
  () => languageStore.lang,
  () => {
    fetchTrending()
  },
)

onMounted(() => {
  fetchTrending()
})
</script>

<style scoped>
.trending-slider {
  margin: 0 auto;
  width: 95%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}
.trending-slider.visible {
  opacity: 1;
}
.mySwiper {
  padding: 24px 0;
}
.slide-link {
  display: flex;
  justify-content: center;
  align-items: center;
}
.poster {
  width: auto;
  height: 160px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.75);
  cursor: pointer;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

:deep(.swiper-slide-active) {
  z-index: 5;
}

:deep(.swiper-slide-active) .poster {
  border-color: var(--glass-border-bright);
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.95),
    0 0 18px rgba(255, 61, 0, 0.5);
}

.poster:hover {
  border-color: var(--glass-border-bright);
}

@media (min-width: 1024px) {
  .poster {
    height: 220px;
  }
}

@media (min-width: 1920px) {
  .poster {
    height: 260px;
  }
}
</style>
