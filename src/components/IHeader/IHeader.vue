<template>
  <header class="container">
    <IButton to="/"> <ILogo /> </IButton>
    <nav class="nav">
      <IButton to="/search" variant="header-link">
        <SearchIcon />
      </IButton>
      <IButton to="/movies" variant="header-link"> {{ $t('header.movies') }} </IButton>
      <IButton to="/series" variant="header-link"> {{ $t('header.series') }} </IButton>
      <IButton to="/collection" variant="header-link">
        {{ $t('header.collection') }}
      </IButton>
    </nav>

    <div class="language-container">
      <MenuButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import ILogo from './ILogo.vue'
import IButton from '../IButton/IButton.vue'
import SearchIcon from '../icons/SearchIcon.vue'
import MenuButton from './MenuButton.vue'
</script>

<style scoped>
.container {
  display: flex;
  gap: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.nav {
  display: flex;
  gap: 10px;
}

.language-container {
  position: absolute;
  right: 10px;
  top: 10px;
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
  .language-container {
    position: static;
    display: flex;
    justify-content: flex-end;
    width: 200px;
  }
}
@media (min-width: 1024px) {
  .language-container {
    width: 250px;
  }
  .icon {
    width: 35px;
    height: 35px;
  }
}
</style>
