<template>
  <IHeader />
  <main>
    <router-view />
  </main>
</template>

<script setup lang="ts">
import IHeader from '@/components/IHeader.vue'
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
