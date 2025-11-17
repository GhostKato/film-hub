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
import ModalAuth from './components/ModalAuth/ModalAuth.vue'
import { useAuthStore } from './stores/auth'
import { useModalStore } from './stores/modal'
import { useRouter } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'

const authStore = useAuthStore()
const modalStore = useModalStore()
const router = useRouter()

authStore.initAuthListener()
const isTyping = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false

  return target.closest('input, textarea, .modal-input, [data-ignore-hotkeys]') !== null
}
const handleHotkeys = (e: KeyboardEvent) => {
  if (isTyping(e.target)) return

  switch (e.key) {
    case '1':
      modalStore.closeAll()
      router.push('/')
      break
    case '2':
      modalStore.closeAll()
      router.push('/search')
      break
    case '3':
      modalStore.closeAll()
      router.push('/movies')
      break
    case '4':
      modalStore.closeAll()
      router.push('/series')
      break
    case '5':
      modalStore.closeAll()
      router.push('/collection')
      break
    case '6':
      modalStore.toggle('menu')
      break
    case 'Escape':
      modalStore.closeAll()
      break
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleHotkeys)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleHotkeys)
  }
})
</script>
