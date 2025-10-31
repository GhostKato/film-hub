<template>
  <img :src="logo" alt="Логотип" class="logo" />
</template>

<script setup lang="ts">
import logo from '@/assets/images/logo.png'
</script>

<style scoped>
.logo {
  width: 100%;
  max-width: 250px;
  height: auto;
}
</style>
