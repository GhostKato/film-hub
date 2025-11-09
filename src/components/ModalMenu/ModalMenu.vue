<template>
  <Transition :name="transitionName">
    <div v-if="modal.modals.menu" class="modal-menu-wrapper" @click.self="close">
      <div class="modal-menu">
        <div class="auth-container">
          <h3 class="user-name">{{ $t('modal-menu.title_welcome') }}</h3>
          <h3 class="user-name">Guest</h3>
          <IButton @click="close" variant="auth-menu-btn">{{ $t('modal-menu.login') }}</IButton>
        </div>

        <div class="language-container">
          <h3 class="user-name">{{ $t('modal-menu.title_language_selection') }}</h3>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal'
import LanguageSwitcher from '../IHeader/LanguageSwitcher.vue'
import IButton from '../IButton/IButton.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const modal = useModalStore()
const width = ref(window.innerWidth)

function close() {
  modal.close('menu')
}

const handleResize = () => {
  width.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const transitionName = computed(() => (width.value > 1023 ? 'slide-top' : 'slide-right'))
</script>

<style scoped>
.modal-menu-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: 55px;
  padding-right: 5px;
  z-index: 50;
  pointer-events: all;
}

.modal-menu {
  padding: 10px;
  border-radius: 8px;
  pointer-events: all;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auth-container,
.language-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background-color: var(--color-dark-grey);
  padding: 10px;
  border-radius: 8px;
}

.user-name {
  text-align: center;
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
  .modal-menu-wrapper {
    padding-top: 70px;
  }
}
@media (min-width: 1024px) {
  .modal-menu-wrapper {
    justify-content: center;

    padding-top: 100px;
  }
  .modal-menu {
    flex-direction: row;
    justify-content: space-between;
    width: 90%;
  }
  .auth-container,
  .language-container {
    flex-direction: row;
  }
}
</style>
