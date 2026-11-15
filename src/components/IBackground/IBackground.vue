<template>
  <div
    ref="bgRef"
    class="background"
    :class="`theme-${theme}`"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div class="ambient-layer">
      <div class="orb orb-primary"></div>
      <div class="orb orb-secondary"></div>
      <div class="orb orb-center"></div>
    </div>

    <div class="cursor-glow" :class="{ active: isHovering }"></div>
    <div class="film-grain"></div>
    <div class="vignette"></div>

    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const bgRef = ref<HTMLElement | null>(null)
const isHovering = ref(false)

const theme = computed(() => {
  const path = route.path
  if (path.startsWith('/series')) return 'series'
  if (path.startsWith('/collection')) return 'collection'
  if (path.startsWith('/filter-search') || path.startsWith('/multi-search')) return 'search'
  if (path.startsWith('/person')) return 'person'
  if (path.startsWith('/media') || path.startsWith('/movie') || path.startsWith('/tv')) {
    return 'media'
  }
  return 'default'
})

const handleMouseMove = (e: MouseEvent) => {
  if (!bgRef.value) return
  const rect = bgRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  bgRef.value.style.setProperty('--mouse-x', `${x}px`)
  bgRef.value.style.setProperty('--mouse-y', `${y}px`)
  isHovering.value = true
}

const handleMouseLeave = () => {
  isHovering.value = false
}
</script>

<style scoped>
/* 1. Фильмы (default) — Электрик-кобальт (чистый синий) */
.background {
  --bg-glow-1: rgba(25, 85, 235, 0.85);
  --bg-glow-2: rgba(15, 50, 165, 0.75);
  --bg-glow-3: rgba(20, 70, 200, 0.65);
  --cursor-color: rgba(65, 130, 255, 0.28);
  --mouse-x: 50%;
  --mouse-y: 30%;

  position: relative;
  width: 100%;
  min-height: calc(100vh - 100px);
  background-color: #030612;
  transition: background-color 0.8s ease;
  overflow: hidden;
}

/* 2. Сериалы — Янтарно-золотой (максимальный контраст с синими фильмами) */
.theme-series {
  --bg-glow-1: rgba(235, 145, 15, 0.85);
  --bg-glow-2: rgba(175, 95, 5, 0.75);
  --bg-glow-3: rgba(205, 120, 10, 0.65);
  --cursor-color: rgba(255, 185, 45, 0.28);
  background-color: #110902;
}

/* 3. Коллекции — Изумрудно-малахитовый (яркий зелёный) */
.theme-collection {
  --bg-glow-1: rgba(16, 195, 115, 0.85);
  --bg-glow-2: rgba(8, 130, 75, 0.75);
  --bg-glow-3: rgba(12, 165, 95, 0.65);
  --cursor-color: rgba(45, 240, 150, 0.26);
  background-color: #021008;
}

/* 4. Поиск и фильтры — Насыщенный ультрафиолет (контраст с зелёным и жёлтым) */
.theme-search {
  --bg-glow-1: rgba(155, 45, 235, 0.85);
  --bg-glow-2: rgba(105, 20, 175, 0.75);
  --bg-glow-3: rgba(130, 30, 205, 0.65);
  --cursor-color: rgba(190, 95, 255, 0.28);
  background-color: #0b0312;
}

/* 5. Карточка фильма/сериала — Ледяной бирюзовый циан */
.theme-media {
  --bg-glow-1: rgba(10, 190, 215, 0.85);
  --bg-glow-2: rgba(5, 125, 150, 0.75);
  --bg-glow-3: rgba(8, 160, 185, 0.65);
  --cursor-color: rgba(55, 230, 255, 0.26);
  background-color: #020e12;
}

/* 6. Страница актёра — Тёплая бронза / терракота */
.theme-person {
  --bg-glow-1: rgba(205, 105, 45, 0.82);
  --bg-glow-2: rgba(145, 65, 20, 0.75);
  --bg-glow-3: rgba(175, 85, 32, 0.62);
  --cursor-color: rgba(245, 145, 80, 0.25);
  background-color: #100804;
}

/* Плавающие световые пятна */
.ambient-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  will-change: transform, opacity;
  transition: background 0.8s ease;
}

.orb-primary {
  top: -12%;
  left: 8%;
  width: 60vw;
  height: 60vw;
  max-width: 950px;
  max-height: 950px;
  background: radial-gradient(circle, var(--bg-glow-1) 0%, transparent 68%);
  animation: floatPrimary 12s ease-in-out infinite alternate;
}

.orb-secondary {
  top: 20%;
  right: 5%;
  width: 55vw;
  height: 55vw;
  max-width: 850px;
  max-height: 850px;
  background: radial-gradient(circle, var(--bg-glow-2) 0%, transparent 68%);
  animation: floatSecondary 15s ease-in-out infinite alternate;
}

.orb-center {
  top: 35%;
  left: 25%;
  width: 50vw;
  height: 50vw;
  max-width: 800px;
  max-height: 800px;
  background: radial-gradient(circle, var(--bg-glow-3) 0%, transparent 70%);
  animation: floatCenter 10s ease-in-out infinite alternate;
}

/* Подсветка за курсором */
.cursor-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.4s ease;
  background: radial-gradient(
    500px circle at var(--mouse-x) var(--mouse-y),
    var(--cursor-color),
    transparent 65%
  );
}

.cursor-glow.active {
  opacity: 1;
}

/* Текстура киноплёнки (Film Grain) */
.film-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://w3.org id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* Мягкая виньетка по краям */
.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.55) 100%);
}

.content {
  position: relative;
  z-index: 2;
}

@keyframes floatPrimary {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.9;
  }
  50% {
    transform: translate(8%, 10%) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-5%, 14%) scale(0.98);
    opacity: 0.85;
  }
}

@keyframes floatSecondary {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.85;
  }
  50% {
    transform: translate(-10%, -6%) scale(1.12);
    opacity: 1;
  }
  100% {
    transform: translate(-4%, 12%) scale(0.96);
    opacity: 0.8;
  }
}

@keyframes floatCenter {
  0% {
    transform: translate(0, 0) scale(0.95);
    opacity: 0.75;
  }
  100% {
    transform: translate(5%, -8%) scale(1.12);
    opacity: 1;
  }
}

@media (hover: none) {
  .cursor-glow {
    display: none;
  }
}
</style>
