import { auth } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import type { User } from 'firebase/auth'

// Реєстрація
export const register = async (
  nickname: string,
  email: string,
  password: string,
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: nickname })
  }
  return userCredential.user
}

// Логін
export const login = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

// Логаут
export const logout = async () => {
  await signOut(auth)
}

// Оновлення профілю
export const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
  if (!auth.currentUser) throw new Error('No user logged in')
  await updateProfile(auth.currentUser, updates)
  return auth.currentUser
}
