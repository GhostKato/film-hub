<template>
  <Transition :name="transitionName">
    <div v-if="modal.modals.menu" class="modal-panel-wrapper" @click.self="close">
      <div class="modal-panel">
        <header class="modal-header">
          <h2>Guest</h2>
          <button class="close-btn" @click="close">✕</button>
        </header>
        <div class="modal-body">
          <button>Log In</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useModalStore } from '@/stores/modal'

const modal = useModalStore()
const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))

const transitionName = computed(() => (windowWidth.value < 768 ? 'slide-top' : 'slide-right'))

function close() {
  modal.close('menu')
}
</script>

<style scoped>
.modal-panel-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 60px;
  z-index: 1000;
  pointer-events: all;
}

.modal-panel {
  background: var(--color-dark-grey);
  width: 90%;
  min-width: 320px;
  padding: 20px;
  box-shadow: 0 8px 24px var(--color-shadow);
  border-radius: 8px;
  pointer-events: all;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
}

.modal-body {
  margin-top: 15px;
}

.slide-top-enter-active,
.slide-top-leave-active {
  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
}
.slide-top-enter-from,
.slide-top-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (min-width: 768px) {
  .modal-panel-wrapper {
    justify-content: flex-end;
    align-items: flex-start;
    padding-right: 20px;
    padding-top: 70px;
  }
  .modal-panel {
    width: 350px;
  }
}
</style>
