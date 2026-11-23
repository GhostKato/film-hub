<template>
  <Transition name="modal-fade">
    <div
      v-if="modalStore.modals.auth"
      class="modal-backdrop"
      @click.self="modalStore.close('auth')"
    >
      <div class="auth-stack">
        <div class="glass-card logo-card" @click="goHome">
          <ILogo />
        </div>

        <div class="glass-card modal-content">
          <IButton @click="modalStore.close('auth')" variant="close"><XIcon /></IButton>
          <div class="switch-buttons" v-if="authStore.mode !== 'edit'">
            <IButton
              variant="auth-nav-btn"
              :class="{ active: authStore.mode === 'login' }"
              @click="authStore.setMode('login')"
            >
              {{ $t('modal_auth.nav_btn_login') }}
            </IButton>
            <IButton
              variant="auth-nav-btn"
              :class="{ active: authStore.mode === 'register' }"
              @click="authStore.setMode('register')"
            >
              {{ $t('modal_auth.nav_btn_register') }}
            </IButton>
          </div>
          <h2 class="title-edit" v-else>{{ $t('modal_edit.title') }}</h2>

          <IForm />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useModalStore } from '@/stores/modal'
import { useAuthStore } from '@/stores/auth'
import IForm from './IForm.vue'
import IButton from '../IButton/IButton.vue'
import ILogo from '../ILogo/ILogo.vue'
import XIcon from '../icons/XIcon.vue'
import { autoClose } from '@/utils/autoClose'

const modalStore = useModalStore()
const authStore = useAuthStore()
const router = useRouter()

function goHome() {
  modalStore.close('auth')
  router.push('/')
}

autoClose('auth', 50000)
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(5, 7, 10, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  overflow-y: auto;
  z-index: 80;
}
.auth-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 320px;
}
.glass-card {
  position: relative;
  background:
    radial-gradient(circle at 12% 0%, rgba(159, 27, 25, 0.24) 0%, transparent 48%),
    radial-gradient(circle at 92% 100%, rgba(25, 85, 235, 0.18) 0%, transparent 52%),
    var(--glass-modal);
  backdrop-filter: blur(24px) saturate(165%);
  -webkit-backdrop-filter: blur(24px) saturate(165%);
  border-radius: 18px;
  border: 1px solid var(--glass-border-bright);
  box-shadow:
    0 24px 55px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.26);
}
.logo-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
}
.logo-card :deep(.logo-wrapper) {
  margin-right: 0;
}
.modal-content {
  padding: 40px 18px 20px 18px;
}
.switch-buttons {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}
.title-edit {
  text-align: center;
  margin-bottom: 14px;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.28s ease;
}
.modal-fade-enter-active .auth-stack,
.modal-fade-leave-active .auth-stack {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .auth-stack,
.modal-fade-leave-to .auth-stack {
  opacity: 0;
  transform: translateY(14px) scale(0.96);
}
@media (min-width: 768px) {
  .auth-stack {
    width: 420px;
  }
}
</style>
