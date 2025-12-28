<template>
  <IButton v-if="!modalStore.modals.release" @click="toggleMenu" variant="menu-btn">
    <MenuIcon v-if="!modalStore.modals.menu" />
    <span v-else class="close-icon">✕</span>
  </IButton>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal'
import MenuIcon from '@/components/icons/MenuIcon.vue'
import IButton from '@/components/IButton/IButton.vue'

const modalStore = useModalStore()

function toggleMenu() {
  modalStore.toggle('menu')
}
</script>

<style scoped>
.menu-btn:hover svg {
  transform: scale(1.1);
}

.close-icon {
  font-size: 28px;
  line-height: 1;
  color: var(--color-white);
}
</style>
