<template>
  <div class="container">
    <HomeCurtains :isOpen="isOpen" />
    <HomeProjector :hideProjector="hideProjector" />
    <HomeVideo />
    <div class="background-image">
      <div class="main-hello" :class="{ visible: visibilityMainHello }">
        <h1 class="main-title">Hello, movie buff! What are we watching today?</h1>
        <BaseButton to="/catalog" variant="button"> Catalog </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from '../components/BaseButton.vue'
import HomeCurtains from '../components/HomeCurtains.vue'
import HomeProjector from '../components/HomeProjector.vue'
import HomeVideo from '../components/HomeVideo.vue'

const isOpen = ref(false)
const hideProjector = ref(false)
const visibilityMainHello = ref(false)

onMounted(() => {
  setTimeout(() => (isOpen.value = true), 1000)
  setTimeout(
    () => {
      hideProjector.value = true
      visibilityMainHello.value = true
    },
    1000 + 2500 + 2000,
  )
})
</script>

<style scoped>
.container {
  position: absolute;
  top: 100px;
  left: 0;
  width: 100%;
  height: calc(100vh - 100px);
  background-color: black;
  overflow: hidden;
}

.background-image {
  display: flex;
  justify-content: center;
  width: 100%;
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
  padding: 60px;
  opacity: 0;
  transition:
    opacity 5s ease-in-out,
    transform 2s ease-in-out;
}
.main-hello.visible {
  opacity: 1;
}
.main-title {
  font-size: 35px;
  font-weight: bold;
  color: white;
}
.main-hello.visible {
  opacity: 1;
}
</style>
