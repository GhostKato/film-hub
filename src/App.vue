<template>
  <MainHeader />
  <FilmHubIntro />
</template>

<script setup lang="ts">
import MainHeader from '@/components/MainHeader.vue'
import FilmHubIntro from './components/FilmHubIntro.vue'
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  height: 100%;
}
</style>
