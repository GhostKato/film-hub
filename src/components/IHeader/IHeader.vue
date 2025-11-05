<template>
  <header class="container">
    <BaseButton to="/"> <HeaderLogo /> </BaseButton>

    <nav class="nav">
      <BaseButton to="/search/multi" variant="header-link">
        <SearchIcon />
      </BaseButton>
      <BaseButton to="/movies" variant="header-link"> {{ $t('header.movies') }} </BaseButton>
      <BaseButton to="/series" variant="header-link"> {{ $t('header.series') }} </BaseButton>
      <BaseButton to="/collection" variant="header-link">
        {{ $t('header.collection') }}
      </BaseButton>
    </nav>

    <div class="language-div">
      <LanguageSwitcher />
    </div>
  </header>
</template>

<script setup lang="ts">
import HeaderLogo from '@/components/IHeader/HeaderLogo.vue'
import BaseButton from '../BaseButton/BaseButton.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import SearchIcon from '../icons/SearchIcon.vue'
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
  gap: 20px;
}

.language-div {
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
  .language-div {
    position: static;
    display: flex;
    justify-content: flex-end;
    width: 200px;
  }
}
@media (min-width: 1024px) {
  .language-div {
    width: 250px;
  }
  .icon {
    width: 35px;
    height: 35px;
  }
}
</style>
