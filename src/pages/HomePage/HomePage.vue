<template>
  <div class="container">
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
import { ref, onMounted } from 'vue'
import ICurtains from './components/ICurtains.vue'
import IProjector from './components/IProjector.vue'
import IVideo from './components/IVideo.vue'
import ISlider from './components/ISlider.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import IFooter from './components/IFooter.vue'

const isOpen = ref(false)
const hideProjector = ref(false)
const visibilityMainHello = ref(false)
const visibilityTrendingSlider = ref(false)

onMounted(() => {
  setTimeout(() => (isOpen.value = true), 1000)
  setTimeout(
    () => {
      hideProjector.value = true
      visibilityMainHello.value = true
      visibilityTrendingSlider.value = true
    },
    1000 + 2500 + 1000,
  )
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
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  background-image: url('@/assets/images/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.main-hello {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 65%;
  padding: 20px;
  opacity: 0;
  transition: opacity 5s ease-in-out;
}
.main-hello.visible {
  opacity: 1;
}
.main-title {
  font-size: 25px;
  font-weight: bold;
}
@media (min-width: 768px) {
  .main-title {
    font-size: 35px;
  }
}
</style>
