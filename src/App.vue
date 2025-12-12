<template>
  <IHeader />
  <main>
    <router-view />
  </main>
  <ModalMenu />
  <ModalAuth />
  <ILoader />
  <HotKeys />
  <INotification />
</template>

<script setup lang="ts">
import IHeader from '@/components/IHeader/IHeader.vue'
import ILoader from '@/components/ILoader/ILoader.vue'
import ModalMenu from '@/components/ModalMenu/ModalMenu.vue'
import ModalAuth from './components/ModalAuth/ModalAuth.vue'
import { useAuthStore } from './stores/auth'
import { onMounted, watch } from 'vue'
import { useLoaderStore } from './stores/loader'
import HotKeys from './components/HotKeys/HotKeys.vue'
import { MAIN_ACCOUNT_ID } from '@/constants/env'
import { useMediaStore } from './stores/media'
import INotification from './components/INotification/INotification.vue'

const authStore = useAuthStore()
const loaderStore = useLoaderStore()

authStore.initAuthListener()
const mediaStore = useMediaStore()

onMounted(async () => {
  loaderStore.showGlobalLoader()
  await mediaStore.load()
  if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
    await mediaStore.fetchRecommended()
  }
  setTimeout(() => {
    loaderStore.hideGlobalLoader()
  }, 500)
})

watch(
  () => authStore.user,
  async () => {
    loaderStore.showLoader()
    await mediaStore.load()
    if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
      await mediaStore.fetchRecommended()
    }
    loaderStore.hideLoader()
  },
)
</script>
