<template>
  <header class="container">
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

    <div class="menu-btn-container">
      <MenuButton />
    </div>
    <div :class="releaseStyle">
      <ReleaseButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import ILogo from './ILogo.vue'
import IButton from '../IButton/IButton.vue'
import SearchIcon from '../icons/SearchIcon.vue'
import MenuButton from './MenuButton.vue'
import ReleaseButton from './ReleaseButton.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHomePage = computed(() => route.path === '/')

const releaseStyle = computed(
  () => 'release-base ' + (isHomePage.value ? 'release-home' : 'release-other'),
)
</script>

<style scoped>
.container {
  display: flex;
  gap: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100px;
  position: relative;
}

.nav {
  display: flex;
  gap: 10px;
}

.icon {
  width: 25px;
  height: 25px;
}

.icon:hover {
  fill: var(--color-hover);
}
.release-base {
  position: absolute;
  z-index: 50;
}
.release-home {
  right: 1px;
  top: 85px;
}

.release-other {
  right: -3px;
  top: 100px;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
    justify-content: space-around;
  }
  .menu-btn-container {
    display: flex;
    justify-content: flex-end;
    width: 200px;
  }
  .release-other {
    right: 8px;
    top: 120px;
  }
}
@media (min-width: 1024px) {
  .menu-btn-container {
    width: 250px;
  }
  .icon {
    width: 35px;
    height: 35px;
  }
  .release-home {
    right: 12px;
    top: 85px;
  }
  .release-other {
    right: 18px;
  }
}
@media (min-width: 1280px) {
  .release-home {
    right: 55px;
  }
}
@media (min-width: 1920px) {
  .release-home,
  .release-other {
    right: 55px;
    top: 35px;
  }
}
@media (min-width: 2560px) {
  .release-home,
  .release-other {
    right: 75px;
    top: 40px;
  }
}
</style>
