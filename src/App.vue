<template>
  <IHeader />
  <main>
    <router-view />
    <ModalMenu />
    <ModalAuth />
    <ILoader />
    <HotKeys />
  </main>
</template>

<script setup lang="ts">
import IHeader from '@/components/IHeader/IHeader.vue'
import ILoader from '@/components/ILoader/ILoader.vue'
import ModalMenu from '@/components/ModalMenu/ModalMenu.vue'
import ModalAuth from './components/ModalAuth/ModalAuth.vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import { useLoaderStore } from './stores/loader'
import HotKeys from './components/HotKeys/HotKeys.vue'

const authStore = useAuthStore()
const loaderStore = useLoaderStore()

authStore.initAuthListener()

onMounted(() => {
  loaderStore.showGlobalLoader()

  setTimeout(() => {
    loaderStore.hideGlobalLoader()
  }, 500)
})
</script>
