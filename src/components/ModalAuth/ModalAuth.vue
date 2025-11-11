<template>
  <div v-if="modal.modals.auth" class="modal-backdrop" @click.self="close">
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

const close = () => {
  modal.close('auth')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 320px;
}

.switch-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.switch-buttons button {
  flex: 1;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #f0f0f0;
}

.switch-buttons button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
