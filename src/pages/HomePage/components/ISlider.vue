<template>
  <div class="trending-slider" :class="{ visible: visibilityTrendingSlider }">
    <Swiper
      :modules="[Autoplay]"
      :slides-per-view="5"
      :space-between="15"
      :loop="moviesWithPoster.length > maxSlidesPerView"
      :autoplay="{ delay: 2000, disableOnInteraction: false }"
      class="mySwiper"
      :breakpoints="breakpoints"
    >
      <SwiperSlide v-for="movie in moviesWithPoster" :key="movie.id">
        <router-link :to="`/media/${movie.media_type}/${movie.id}`">
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
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/navigation'

import { getTrendingAllDay } from '@/api/tmdb'
import { getImageUrl } from '@/utils/getImageUrl'
import { useLanguageStore } from '@/stores/language'
import { useLoaderStore } from '@/stores/loader'
import type { SliderType } from '@/types/slider'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'

const loaderStore = useLoaderStore()
const { t } = useI18n()

const maxSlidesPerView = computed(() => {
  const values = Object.values(breakpoints).map((b) => b.slidesPerView)
  return Math.max(...values)
})

interface Props {
  visibilityTrendingSlider: boolean
}

const { visibilityTrendingSlider } = defineProps<Props>()

const movies = ref<SliderType[]>([])
const moviesWithPoster = computed(() => movies.value.filter((m) => m.poster_path))

const breakpoints = {
  375: { slidesPerView: 4 },
  768: { slidesPerView: 8 },
  1024: { slidesPerView: 11 },
  1920: { slidesPerView: 20 },
  2560: { slidesPerView: 25 },
}

const fetchTrending = async () => {
  const allResults: SliderType[] = []
  try {
    for (let page = 1; page <= 3; page++) {
      loaderStore.showLoader()
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

.poster {
  width: auto;
  height: 95px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.poster:hover {
  transform: scale(1.05) translateY(10px);
}
</style>
