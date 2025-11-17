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
  modalStore.closeAll()
  switch (e.key) {
    case '1':
      router.push('/')
      break
    case '2':
      router.push('/search')
      break
    case '3':
      router.push('/movies')
      break
    case '4':
      router.push('/series')
      break
    case '5':
      router.push('/collection')
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
