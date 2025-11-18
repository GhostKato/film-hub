<template>
  <div style="display: none"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useRouter } from 'vue-router'

const modalStore = useModalStore()
const router = useRouter()

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
  window.addEventListener('keydown', handleHotkeys)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleHotkeys)
})
</script>
