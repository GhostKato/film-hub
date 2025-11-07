<template>
  <div v-if="loading" class="loader-overlay">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLoaderStore } from '@/stores/loader'

const { loading } = storeToRefs(useLoaderStore())
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-transparent-black);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid var(--color-grey);
  border-top-color: var(--color-white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
