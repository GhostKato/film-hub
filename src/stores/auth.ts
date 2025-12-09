import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from 'firebase/auth'
import * as FirebaseAPI from '@/api/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'
import { useLoaderStore } from '@/stores/loader'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loaderStore = useLoaderStore()
  const error = ref<string | null>(null)
  const mode = ref<'login' | 'register' | 'edit'>('login')

  const register = async (nickname: string, email: string, password: string) => {
    loaderStore.showLoader()
    error.value = null
    try {
      const u = await FirebaseAPI.register(nickname, email, password)
      user.value = u
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message
      else error.value = String(err)
    } finally {
      loaderStore.hideLoader()
    }
  }

  const login = async (email: string, password: string) => {
    loaderStore.showLoader()
    error.value = null
    try {
      const u = await FirebaseAPI.login(email, password)
      user.value = u
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message
      else error.value = String(err)
    } finally {
      loaderStore.hideLoader()
    }
  }

  const logout = async () => {
    loaderStore.showLoader()
    error.value = null
    try {
      await FirebaseAPI.logout()
      user.value = null
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message
      else error.value = String(err)
    } finally {
      loaderStore.hideLoader()
    }
  }

  const updateProfile = async (updates: FirebaseAPI.ProfileUpdates) => {
    if (!user.value) {
      error.value = 'No user logged in'
      return
    }
    loaderStore.showLoader()
    error.value = null
    try {
      const updatedUser = await FirebaseAPI.updateUserProfile(updates)
      user.value = updatedUser
    } catch (err: unknown) {
      if (err instanceof Error) error.value = err.message
      else error.value = String(err)
    } finally {
      loaderStore.hideLoader()
    }
  }

  const setMode = (newMode: 'login' | 'register' | 'edit') => {
    mode.value = newMode
  }

  const initAuthListener = () => {
    onAuthStateChanged(auth, (u) => {
      user.value = u
    })
  }

  return { user, error, mode, register, login, logout, updateProfile, setMode, initAuthListener }
})
