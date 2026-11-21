<template>
  <Transition name="modal-fade">
    <div
      v-if="modalStore.modals.auth"
      class="modal-backdrop"
      @click.self="modalStore.close('auth')"
    >
      <div class="modal-content">
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
  </Transition>
</template>

<script lang="ts" setup>
import { useModalStore } from '@/stores/modal'
import IForm from './IForm.vue'
import IButton from '../IButton/IButton.vue'
import { useAuthStore } from '@/stores/auth'
import XIcon from '../icons/XIcon.vue'
import { autoClose } from '@/utils/autoClose'

const modalStore = useModalStore()
const authStore = useAuthStore()

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
  z-index: 80;
}
.modal-content {
  position: relative;
  background:
    radial-gradient(circle at 12% 0%, rgba(159, 27, 25, 0.24) 0%, transparent 48%),
    radial-gradient(circle at 92% 100%, rgba(25, 85, 235, 0.18) 0%, transparent 52%),
    var(--glass-modal);
  backdrop-filter: blur(24px) saturate(165%);
  -webkit-backdrop-filter: blur(24px) saturate(165%);
  padding: 40px 18px 20px 18px;
  border-radius: 18px;
  width: 320px;
  border: 1px solid var(--glass-border-bright);
  box-shadow:
    0 28px 65px rgba(0, 0, 0, 0.92),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
.switch-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.title-edit {
  text-align: center;
  margin-bottom: 14px;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.28s ease;
}
.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  opacity: 0;
  transform: translateY(14px) scale(0.96);
}
@media (min-width: 768px) {
  .modal-content {
    width: 420px;
  }
}
</style>
