<template>
  <div class="container">
    <!-- Ліва штора -->
    <div class="curtain curtain-left" :class="{ open: isOpen }"></div>
    <!-- Права штора -->
    <div class="curtain curtain-right" :class="{ open: isOpen }"></div>

    <!-- Фонова картинка -->
    <div class="background-image">
      <img src="@/assets/images/background.jpg" alt="Background" />
    </div>

    <!-- Прожектор -->
    <div class="projector-light" :class="{ hide: hideProjector }"></div>

    <!-- Відео -->
    <div class="video-container" :class="{ fall: hideLogo }">
      <video
        src="@/assets/videos/intro.mp4"
        autoplay
        muted
        loop
        playsinline
        class="intro-video"
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isOpen = ref(false)
const hideProjector = ref(false)
const hideLogo = ref(false)

onMounted(() => {
  // 1. Відкрити штори
  setTimeout(() => (isOpen.value = true), 1000)

  // 2. Через 3 секунди після повного відкриття штор — загасити прожектор і логотип (відео) падає
  setTimeout(
    () => {
      hideProjector.value = true
      hideLogo.value = true
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

/* ====== ШТОРИ ====== */
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

/* ====== ФОН ====== */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}
.background-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ====== ПРОЖЕКТОР ====== */
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
}

/* ====== ВІДЕО ====== */
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
@media (min-width: 768px) {
  .intro-video {
    width: 450px;
    height: 200px;
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
