<template>
  <div class="container">
    <div class="curtain curtain-left" :class="{ open: isOpen }"></div>
    <div class="curtain curtain-right" :class="{ open: isOpen }"></div>

    <div class="projector-light" :class="{ hide: hideProjector }"></div>

    <div class="video-container">
      <video
        src="@/assets/videos/intro.mp4"
        autoplay
        muted
        loop
        playsinline
        class="intro-video"
      ></video>
    </div>

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
import BaseButton from './BaseButton.vue'

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
.curtain {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background: repeating-linear-gradient(90deg, #8b0000 0%, #a00000 10%, #8b0000 20%);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.8);
  transition: transform 2.5s ease-in-out;
  z-index: 30;
}
.curtain-left {
  left: 0;
  transform-origin: left;
}
.curtain-right {
  right: 0;
  transform-origin: right;
}
.curtain-left.open {
  transform: translateX(-100%);
}
.curtain-right.open {
  transform: translateX(100%);
}
.projector-light {
  position: absolute;
  width: 140%;
  height: 140%;
  top: -20%;
  left: -20%;
  background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.8), transparent 60%);
  filter: blur(80px);
  opacity: 1;
  z-index: 20;
  transition:
    opacity 2s ease-in-out,
    transform 2s ease-in-out;
}
.projector-light.hide {
  opacity: 0;
  transform: scale(1.2);
  pointer-events: none;
}
.video-container {
  position: absolute;
  top: 44%;
  left: 49%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translate(-49%, -50%);
  z-index: 15;
}
.intro-video {
  width: 335px;
  height: 140px;
  object-fit: cover;
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
@media (min-width: 768px) {
  .intro-video {
    width: 450px;
    height: 200px;
  }
  .main-title {
    font-size: 40px;
  }
}
@media (min-width: 1080px) {
  .intro-video {
    width: 400px;
    height: 170px;
  }
}
@media (min-width: 2160px) {
  .intro-video {
    width: 525px;
    height: 230px;
  }
}
</style>
