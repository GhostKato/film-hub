<template>
  <IHeader />
  <main>
    <router-view />
  </main>
</template>

<script setup lang="ts">
import IHeader from '@/components/IHeader/IHeader.vue'
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
  color: white;
  background-color: #000;
}
body {
  overflow-y: scroll;
  overflow-x: hidden;
}
html {
  overflow: hidden;
}
body::-webkit-scrollbar {
  width: 8px;
}
body::-webkit-scrollbar-track {
  background: #1a1a1a;
}
body::-webkit-scrollbar-thumb {
  background-color: #000;
  border-radius: 4px;
  border: 1px solid #1a1a1a;
}
body::-webkit-scrollbar-thumb:hover {
  background-color: #4d4d4d;
}
body {
  scrollbar-width: thin;
  scrollbar-color: #333 #1a1a1a;
}
</style>
