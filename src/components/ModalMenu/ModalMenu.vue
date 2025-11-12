<template>
  <Transition :name="transitionName">
    <div v-if="modal.modals.menu" class="modal-menu-wrapper" @click.self="modal.close('menu')">
      <div class="modal-menu">
        <div class="auth-container">
          <h3 class="user-greeting">{{ $t('modal-menu.title_welcome') }}</h3>
          <h3 class="user-name">{{ nickname }}</h3>
          <IButton @click="auth.user ? handleLogout() : openAuthModal()" variant="auth-btn">
            {{ auth.user ? $t('modal-menu.logout') : $t('modal-menu.login') }}
          </IButton>
        </div>

        <div class="language-container">
          <h3 class="language-title">{{ $t('modal-menu.title_language_selection') }}</h3>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal'
import LanguageSwitcher from './LanguageSwitcher.vue'
import IButton from '../IButton/IButton.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const modal = useModalStore()
const auth = useAuthStore()
const width = ref(window.innerWidth)
const { t } = useI18n()

function openAuthModal() {
  modal.close('menu')
  modal.open('auth')
}

const handleLogout = async () => {
  await auth.logout()
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

const nickname = computed(() => auth.user?.displayName ?? t('modal-menu.displayName'))
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
  border: 2px solid var(--color-black);
}

.user-name,
.language-title,
.user-greeting {
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
  .user-name,
  .language-title,
  .user-greeting {
    font-size: 20px;
  }
}
@media (min-width: 1024px) {
  .modal-menu-wrapper {
    justify-content: center;
    padding-top: 90px;
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
