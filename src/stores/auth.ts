import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from 'firebase/auth'
import * as FirebaseAPI from '@/api/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const register = async (nickname: string, email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const u = await FirebaseAPI.register(nickname, email, password)
      user.value = u
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message
      else error.value = String(err)
    } finally {
      loading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const u = await FirebaseAPI.login(email, password)
      user.value = u
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message
      else error.value = String(err)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null
    try {
      await FirebaseAPI.logout()
      user.value = null
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message
      else error.value = String(err)
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!user.value) {
      error.value = 'No user logged in'
      return
    }
    loading.value = true
    error.value = null
    try {
      const updatedUser = await FirebaseAPI.updateUserProfile(updates)
      user.value = updatedUser
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message
      else error.value = String(err)
    } finally {
      loading.value = false
    }
  }

  const initAuthListener = () => {
    onAuthStateChanged(auth, (u) => {
      user.value = u
    })
  }

  return { user, loading, error, register, login, logout, updateProfile, initAuthListener }
})
