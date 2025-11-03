<template>
  <div class="trending-slider" :class="{ visible: visibilityTrendingSlider }">
    <Swiper
      :modules="[Autoplay]"
      :slides-per-view="5"
      :space-between="15"
      :loop="true"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
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
import { ref, onMounted, computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/navigation'

import { getTrendingAllDay } from '@/api/tmdb'
import { getImageUrl } from '@/utils/getImageUrl'

interface Props {
  visibilityTrendingSlider: boolean
}

const { visibilityTrendingSlider } = defineProps<Props>()

interface Movie {
  id: number
  title?: string
  name?: string
  poster_path?: string
  media_type: 'movie' | 'tv'
}

const movies = ref<Movie[]>([])

const moviesWithPoster = computed(() => movies.value.filter((m) => m.poster_path))

const breakpoints = {
  320: { slidesPerView: 5 },
  768: { slidesPerView: 8 },
  1080: { slidesPerView: 20 },
  2160: { slidesPerView: 30 },
}

const fetchTrending = async () => {
  try {
    const allResults: Movie[] = []

    for (let page = 1; page <= 3; page++) {
      const data = await getTrendingAllDay(page)
      allResults.push(...data.results)
    }

    movies.value = allResults
  } catch (err) {
    console.error('Failed to fetch trending movies:', err)
  }
}

onMounted(() => {
  fetchTrending()
})
</script>

<style scoped>
.trending-slider {
  margin: 0 auto;
  width: 95%;
  opacity: 0;
  transition: opacity 5s ease-in-out;
}
.trending-slider.visible {
  opacity: 1;
}
.poster {
  width: auto;
  height: 100px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}
.poster:hover {
  transform: scale(1.05) translateY(10px);
}
</style>
