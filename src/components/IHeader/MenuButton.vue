<template>
  <button @click="toggleMenu" class="menu-btn">
    <MenuIcon v-if="!modalStore.modals.menu" :color="'var(--color-white)'" />
    <span v-else class="close-icon">✕</span>
  </button>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal'
import MenuIcon from '@/components/icons/MenuIcon.vue'

const modalStore = useModalStore()

function toggleMenu() {
  modalStore.toggle('menu')
}
</script>

<style scoped>
.menu-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.menu-btn:hover svg {
  transform: scale(1.1);
}

.close-icon {
  font-size: 28px;
  line-height: 1;
  color: var(--color-white);
}
@media (min-width: 768px) {
  .menu-btn {
    position: static;
  }
}
</style>
