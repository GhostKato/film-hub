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
import { onBeforeUnmount, onMounted } from 'vue'
import { useModalStore } from './stores/modal'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const modalStore = useModalStore()
authStore.initAuthListener()
const router = useRouter()

const closeAllModals = (e: KeyboardEvent) => {
  if (e.key === 'Escape') modalStore.closeAll()
}
const navigationHotkeys = (e: KeyboardEvent) => {
  const tag = (e.target as HTMLElement).tagName
  if (['INPUT', 'TEXTAREA'].includes(tag)) return
  switch (e.key) {
    case '1':
      router.push('/')
      modalStore.closeAll()
      break
    case '2':
      router.push('/search')
      modalStore.closeAll()
      break
    case '3':
      router.push('/movies')
      modalStore.closeAll()
      break
    case '4':
      router.push('/series')
      modalStore.closeAll()
      break
    case '5':
      router.push('/collection')
      modalStore.closeAll()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', closeAllModals)
  window.addEventListener('keydown', navigationHotkeys)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', closeAllModals)
  window.removeEventListener('keydown', navigationHotkeys)
})
</script>
