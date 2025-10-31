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

    <!-- Логотип -->
    <div class="logo-container" :class="{ fall: hideLogo }">
      <img src="@/assets/images/logo.png" alt="FilmHub Logo" class="logo" />
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

  // 2. Через 3 секунди після повного відкриття штор — загасити прожектор і логотип падає
  setTimeout(
    () => {
      hideProjector.value = true
      hideLogo.value = true
    },
    1000 + 2500 + 2000,
  ) // 1000ms затримка + 2500ms анімація штор + 3000ms після відкриття
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

/* ====== ЛОГОТИП ====== */
.logo-container {
  position: absolute;
  top: 45%;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  background-color: black;
  transform: translate(-50%, -50%);
  z-index: 25;
  opacity: 1;
  transition:
    transform 2s ease-in,
    opacity 2s ease-in;
}
.logo-container.fall {
  transform: translate(-50%, 150%);
  opacity: 0;
}

.logo {
  width: 300px;
}
</style>
