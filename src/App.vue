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
