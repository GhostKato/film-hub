<template>
  <header class="container">
    <router-link to="/">
      <HeaderLogo />
    </router-link>
    <nav class="nav">
      <router-link to="/catalog" class="nav-link">Catalog</router-link>
      <router-link to="/collection" class="nav-link">Collection</router-link>
      <router-link to="/watch-later" class="nav-link">Watch later</router-link>
    </nav>
    <div class="empty-div"></div>
  </header>
</template>

<script setup lang="ts">
import HeaderLogo from '@/components/HeaderLogo.vue'
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
.nav-link {
  color: white;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 24px;
}
.nav-link:hover {
  color: #ff914c;
}
.router-link-active {
  color: #ff914c;
}
.empty-div {
  display: none;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
    justify-content: space-around;
  }
  .empty-div {
    display: block;
    width: 250px;
  }
}
</style>
