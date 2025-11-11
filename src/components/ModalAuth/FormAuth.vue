<template>
  <Form class="form-container" :validation-schema="schema" @submit="onSubmit">
    <div class="field-container" v-if="mode === 'register'">
      <label>Nickname</label>
      <Field class="field" name="nickname" type="text" />
      <ErrorMessage name="nickname" class="error" />
    </div>

    <div class="field-container">
      <label>Email</label>
      <Field class="field" name="email" type="email" />
      <ErrorMessage name="email" class="error" />
    </div>

    <div class="field-container">
      <label>Password</label>
      <Field class="field" name="password" type="password" />
      <ErrorMessage name="password" class="error" />
    </div>

    <IButton variant="auth-btn" type="submit" :disabled="auth.loading">
      {{ mode === 'register' ? 'Register' : 'Login' }}
    </IButton>

    <p v-if="auth.error" class="error">{{ auth.error }}</p>
  </Form>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import IButton from '../IButton/IButton.vue'

const props = defineProps<{ mode: 'login' | 'register' }>()
const auth = useAuthStore()
const modalStore = useModalStore()

const schema = computed(() => {
  if (props.mode === 'register') {
    return yup.object({
      nickname: yup.string().required('Nickname is required').min(3),
      email: yup.string().required('Email is required').email(),
      password: yup.string().required('Password is required').min(6),
    })
  } else {
    return yup.object({
      email: yup.string().required('Email is required').email(),
      password: yup.string().required('Password is required').min(6),
    })
  }
})

const onSubmit = async (values: any) => {
  if (props.mode === 'register') {
    await auth.register(values.nickname, values.email, values.password)
  } else {
    await auth.login(values.email, values.password)
  }

  if (!auth.error) {
    modalStore.close('auth')
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.field-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  width: 100%;
}
.field {
  background: var(--color-black);
  border: none;
  width: 100%;
  border-radius: 8px;
  height: 35px;
  color: var(--color-white);
}
.error {
  color: var(--color-hover);
  font-size: 0.9rem;
}
</style>
