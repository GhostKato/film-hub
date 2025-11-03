<template>
  <div class="container">
    <HomeCurtains :isOpen="isOpen" />
    <HomeProjector :hideProjector="hideProjector" />
    <HomeVideo />
    <div class="background-image">
      <TrendingSlider :visibilityTrendingSlider="visibilityTrendingSlider" />
      <div class="main-hello" :class="{ visible: visibilityMainHello }">
        <h1 class="main-title">What are we watching today?</h1>
        <BaseButton to="/catalog" variant="button"> Catalog </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import HomeCurtains from './components/HomeCurtains.vue'
import HomeProjector from './components/HomeProjector.vue'
import HomeVideo from './components/HomeVideo.vue'
import TrendingSlider from './components/TrendingSlider.vue'

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
  background-color: black;
  overflow: hidden;
}

.background-image {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.main-hello {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  opacity: 0;
  transition: opacity 5s ease-in-out;
}
.main-hello.visible {
  opacity: 1;
}
.main-title {
  font-size: 30px;
  font-weight: bold;
  color: white;
}
@media (min-width: 768px) {
  .main-title {
    font-size: 35px;
  }
}
@media (min-width: 1280px) {
  .main-hello {
    justify-content: center;
    align-items: flex-start;
    margin-left: 30px;
    margin-bottom: 50px;
  }
}
</style>
