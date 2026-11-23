<template>
  <div class="container" @click="skipIntro">
    <ICurtains :isOpen="isOpen" />
    <IProjector :hideProjector="hideProjector" />
    <IVideo />
    <div class="background-image">
      <ISlider :visibilityTrendingSlider="visibilityTrendingSlider" />
      <div class="main-hello" :class="{ visible: visibilityMainHello }">
        <h1 class="main-title">{{ $t('home_page.title') }}</h1>
        <SearchBar />
      </div>
      <IFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ICurtains from './components/ICurtains.vue'
import IProjector from './components/IProjector.vue'
import IVideo from './components/IVideo.vue'
import ISlider from './components/ISlider.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import IFooter from './components/IFooter.vue'

const INTRO_SEEN_KEY = 'film_hub_home_intro_seen'

const alreadySeen = sessionStorage.getItem(INTRO_SEEN_KEY) === '1'

const isOpen = ref(alreadySeen)
const hideProjector = ref(alreadySeen)
const visibilityMainHello = ref(alreadySeen)
const visibilityTrendingSlider = ref(alreadySeen)

let openTimer: ReturnType<typeof setTimeout> | null = null
let revealTimer: ReturnType<typeof setTimeout> | null = null

const finishIntro = () => {
  isOpen.value = true
  hideProjector.value = true
  visibilityMainHello.value = true
  visibilityTrendingSlider.value = true
  sessionStorage.setItem(INTRO_SEEN_KEY, '1')
}

const skipIntro = () => {
  if (visibilityMainHello.value) return
  if (openTimer) clearTimeout(openTimer)
  if (revealTimer) clearTimeout(revealTimer)
  finishIntro()
}

onMounted(() => {
  if (alreadySeen) return

  openTimer = setTimeout(() => {
    isOpen.value = true
  }, 400)

  revealTimer = setTimeout(() => {
    finishIntro()
  }, 2400)
})

onUnmounted(() => {
  if (openTimer) clearTimeout(openTimer)
  if (revealTimer) clearTimeout(revealTimer)
})
</script>

<style scoped>
.container {
  position: relative;
  height: calc(100vh - 100px);
  background-color: var(--color-black);
  overflow: hidden;
}

.background-image {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background-image: url('@/assets/images/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.main-hello {
  position: relative;
  z-index: 25;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding: 12px 20px 24px;
  opacity: 0;
  transition: opacity 1.1s ease-in-out;
}
.main-hello.visible {
  opacity: 1;
}
.main-title {
  font-size: 25px;
  font-weight: bold;
  text-align: center;
}
@media (min-width: 768px) {
  .main-title {
    font-size: 35px;
  }
}
</style>
