<template>
  <Form :validation-schema="schema" @submit="onSubmit">
    <div v-if="mode === 'register'" class="field">
      <label>Nickname</label>
      <Field name="nickname" type="text" />
      <ErrorMessage name="nickname" class="error" />
    </div>

    <div class="field">
      <label>Email</label>
      <Field name="email" type="email" />
      <ErrorMessage name="email" class="error" />
    </div>

    <div class="field">
      <label>Password</label>
      <Field name="password" type="password" />
      <ErrorMessage name="password" class="error" />
    </div>

    <button type="submit" :disabled="authStore.loading">
      {{ mode === 'register' ? 'Register' : 'Login' }}
    </button>

    <p v-if="authStore.error" class="error">{{ authStore.error }}</p>
  </Form>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'

const props = defineProps<{ mode: 'login' | 'register' }>()
const authStore = useAuthStore()
const modalStore = useModalStore()

// Схема валідації
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
    await authStore.register(values.nickname, values.email, values.password)
  } else {
    await authStore.login(values.email, values.password)
  }

  if (!authStore.error) {
    modalStore.close('auth')
  }
}
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
.error {
  color: red;
  font-size: 0.9rem;
}
</style>
