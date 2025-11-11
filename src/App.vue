<template>
  <IHeader />
  <main>
    <router-view />
    <ModalMenu />
    <ModalAuth />
    <ILoader />
  </main>
</template>

<script setup lang="ts">
import IHeader from '@/components/IHeader/IHeader.vue'
import ILoader from '@/components/ILoader/ILoader.vue'
import ModalMenu from '@/components/ModalMenu/ModalMenu.vue'
import { useAuthStore } from './stores/auth'
import ModalAuth from './components/ModalAuth/ModalAuth.vue'

const authStore = useAuthStore()
authStore.initAuthListener()
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
  color: var(--color-white);
  background-color: var(--color-black);
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
  background: var(--color-dark-grey);
}
body::-webkit-scrollbar-thumb {
  background-color: var(color-black);
  border-radius: 8px;
  border: 1px solid var(--color-dark-grey);
}
body::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-grey);
}
body {
  scrollbar-width: thin;
  scrollbar-color: var(--color-grey) var(--color-dark-grey);
}
h1,
h2,
h3,
p {
  margin: 0;
}
</style>
