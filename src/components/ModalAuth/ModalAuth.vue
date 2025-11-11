<template>
  <div v-if="modal.modals.auth" class="modal-backdrop" @click.self="modal.close('auth')">
    <div class="modal-content">
      <div class="switch-buttons">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Login</button>
        <button :class="{ active: mode === 'register' }" @click="mode = 'register'">
          Register
        </button>
      </div>

      <FormAuth :mode="mode" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useModalStore } from '@/stores/modal'
import FormAuth from './FormAuth.vue'

const modal = useModalStore()
const mode = ref<'login' | 'register'>('login')
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 80;
}

.modal-content {
  background: var(--color-dark-grey);
  padding: 15px;
  border-radius: 8px;
  width: 320px;
  border: 2px solid var(--color-black);
}

.switch-buttons {
  display: flex;
  margin-bottom: 10px;
}

.switch-buttons button {
  flex: 1;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  background: var(--color-dark-grey);
  color: white;
}

.switch-buttons button.active {
  background: var(--color-red);
}
</style>
