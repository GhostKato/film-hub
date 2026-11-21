<template>
  <Transition name="menu-fade">
    <div
      v-if="modalStore.modals.menu"
      class="modal-menu-wrapper"
      @click.self="modalStore.close('menu')"
    >
      <div class="modal-menu">
        <div class="auth-container">
          <IButton @click="modalStore.close('menu')" variant="close"><XIcon /></IButton>
          <h3 class="user-greeting">{{ $t('modal_menu.title_welcome') }}</h3>
          <h3 class="user-name">{{ nickname }}</h3>

          <IButton v-if="authStore.user" @click="openUpdateModal()" variant="menu-edit-btn">
            {{ $t('modal_menu.edit') }}
          </IButton>

          <IButton
            @click="authStore.user ? handleLogout() : openAuthModal()"
            variant="menu-auth-btn"
          >
            {{ authStore.user ? $t('modal_menu.logout') : $t('modal_menu.login') }}
          </IButton>
        </div>

        <div class="language-container">
          <h3 class="language-title">{{ $t('modal_menu.title_language_selection') }}</h3>
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
import { notificationStore } from '@/stores/notifications'
import { autoClose } from '@/utils/autoClose'
import XIcon from '../icons/XIcon.vue'

const modalStore = useModalStore()
const authStore = useAuthStore()
const width = ref(window.innerWidth)
const { t } = useI18n()

function openAuthModal() {
  modalStore.close('menu')
  modalStore.open('auth')
  authStore.setMode('login')
}
const handleLogout = async () => {
  await authStore.logout()
  modalStore.close('menu')
}

function openUpdateModal() {
  modalStore.close('menu')
  modalStore.open('auth')
  authStore.setMode('edit')
  notificationStore.info(t('notification_message.updated_profile_user_info'))
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

const nickname = computed(() => authStore.user?.displayName ?? t('modal_menu.displayName'))

autoClose('menu')
</script>

<style scoped>
.modal-menu-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: 60px;
  padding-right: 10px;
  background-color: rgba(5, 7, 10, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 60;
  pointer-events: all;
}
.modal-menu {
  padding: 6px;
  border-radius: 18px;
  pointer-events: all;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.update-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  color: var(--color-white);
}
.update-btn:hover {
  color: var(--color-hover);
}
.auth-container,
.language-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background:
    radial-gradient(circle at 12% 0%, rgba(159, 27, 25, 0.24) 0%, transparent 48%),
    radial-gradient(circle at 92% 100%, rgba(25, 85, 235, 0.18) 0%, transparent 52%),
    var(--glass-modal);
  backdrop-filter: blur(24px) saturate(165%);
  -webkit-backdrop-filter: blur(24px) saturate(165%);
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid var(--glass-border-bright);
  box-shadow:
    0 24px 55px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.26);
}
.auth-container {
  padding-top: 34px;
}
.user-name,
.language-title,
.user-greeting {
  text-align: center;
}
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}
.menu-fade-enter-active .modal-menu,
.menu-fade-leave-active .modal-menu {
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
.menu-fade-enter-from .modal-menu,
.menu-fade-leave-to .modal-menu {
  transform: translateX(30px) scale(0.97);
  opacity: 0;
}
@media (min-width: 768px) {
  .modal-menu-wrapper {
    padding-top: 75px;
    padding-right: 16px;
  }
  .user-name,
  .language-title,
  .user-greeting {
    font-size: 20px;
  }
}
</style>
