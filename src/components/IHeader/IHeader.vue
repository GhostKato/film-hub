<template>
  <header class="container">
    <BaseButton to="/"> <HeaderLogo /> </BaseButton>

    <nav class="nav">
      <BaseButton to="/catalog" variant="header-link"> Catalog </BaseButton>
      <BaseButton to="/collection" variant="header-link"> Collection </BaseButton>
      <BaseButton to="/watch-later" variant="header-link"> Watch later </BaseButton>
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
</script>

<style scoped>
.container {
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.nav {
  display: flex;
  gap: 10px;
}

.empty-div {
  display: none;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
    justify-content: space-around;
  }
  .language-div {
    display: flex;
    justify-content: flex-end;
    width: 200px;
  }
}
@media (min-width: 1024px) {
  .language-div {
    width: 250px;
  }
}
</style>
