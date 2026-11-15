<template>
  <header class="container" :class="`theme-${theme}`">
    <IButton to="/"> <ILogo /> </IButton>
    <nav class="nav">
      <IButton to="/filter-search" variant="header-link">
        <SearchIcon />
      </IButton>
      <IButton to="/movies" variant="header-link"> {{ $t('header.movies') }} </IButton>
      <IButton to="/series" variant="header-link"> {{ $t('header.series') }} </IButton>
      <IButton to="/collection" variant="header-link">
        {{ $t('header.collection') }}
      </IButton>
    </nav>

    <div v-if="isLargeScreen" class="desktop-bar">
      <UserBar />
    </div>
    <div v-else class="mobile-bar">
      <ReleaseButton />
      <MenuButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import ILogo from './ILogo.vue'
import IButton from '../IButton/IButton.vue'
import SearchIcon from '../icons/SearchIcon.vue'
import MenuButton from './MenuButton.vue'
import ReleaseButton from './ReleaseButton.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import UserBar from './UserBar.vue'

const route = useRoute()
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)
const isLargeScreen = computed(() => windowWidth.value >= 1920)

const theme = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/series')) return 'series'
  if (path.startsWith('/collection')) return 'collection'
  if (path.startsWith('/filter-search') || path.startsWith('/multi-search')) return 'search'
  if (path.startsWith('/person')) return 'person'
  if (path.startsWith('/media') || path.startsWith('/movie') || path.startsWith('/tv')) {
    return 'media'
  }
  return 'default'
})

const updateWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
  updateWidth()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<style scoped>
/* 1. Фильмы (default) — Электрик-кобальт */
.container {
  --header-accent: rgba(25, 85, 235, 0.45);
  --header-border: rgba(65, 130, 255, 0.55);

  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  gap: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.92) 0%,
    rgba(10, 5, 5, 0.78) 70%,
    rgba(10, 5, 5, 0.45) 100%
  );
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 18px 35px -15px var(--header-accent),
    0 10px 30px rgba(0, 0, 0, 0.65);
  transition:
    box-shadow 0.6s ease,
    background 0.6s ease;
}

/* Тонкая градиентная линия снизу, растворяющаяся по краям */
.container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 5%;
  width: 90%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--header-border) 50%, transparent 100%);
  transition: background 0.6s ease;
  pointer-events: none;
}

/* Главная страница — фирменный красный кинозал */
.theme-home {
  --header-accent: rgba(159, 27, 25, 0.42);
  --header-border: rgba(220, 45, 40, 0.5);
}

/* 2. Сериалы — Янтарно-золотой */
.theme-series {
  --header-accent: rgba(235, 145, 15, 0.45);
  --header-border: rgba(255, 185, 45, 0.55);
}

/* 3. Коллекции — Изумрудно-малахитовый */
.theme-collection {
  --header-accent: rgba(16, 195, 115, 0.42);
  --header-border: rgba(45, 240, 150, 0.52);
}

/* 4. Поиск и фильтры — Насыщенный ультрафиолет */
.theme-search {
  --header-accent: rgba(155, 45, 235, 0.45);
  --header-border: rgba(190, 95, 255, 0.55);
}

/* 5. Страница фильма/сериала — Ледяной бирюзовый циан */
.theme-media {
  --header-accent: rgba(10, 190, 215, 0.42);
  --header-border: rgba(55, 230, 255, 0.52);
}

/* 6. Страница актёра — Тёплая бронза */
.theme-person {
  --header-accent: rgba(205, 105, 45, 0.42);
  --header-border: rgba(245, 145, 80, 0.5);
}

.nav {
  display: flex;
  gap: 15px;
}

.mobile-bar {
  display: flex;
  position: absolute;
  top: 17px;
  right: 1px;
}
.icon {
  width: 25px;
  height: 25px;
}

.icon:hover {
  fill: var(--color-hover);
}
@media (min-width: 768px) {
  .container {
    flex-direction: row;
    justify-content: space-around;
  }
  .mobile-bar {
    position: static;
    display: flex;
    justify-content: flex-end;
    width: 200px;
  }
}
@media (min-width: 1024px) {
  .mobile-bar {
    width: 250px;
  }
  .icon {
    width: 35px;
    height: 35px;
  }
}
</style>
