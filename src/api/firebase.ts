import { auth } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { FirebaseItemType } from '@/types/media'
import { updateProfile as fbUpdateProfile, updatePassword } from 'firebase/auth'

// Registration
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

// Login
export const login = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

// Logout
export const logout = async () => {
  await signOut(auth)
}

// Profile update
export interface ProfileUpdates {
  displayName?: string
  email?: string
  password?: string
  currentPassword: string
}
export const updateUserProfile = async (updates: ProfileUpdates) => {
  const user = auth.currentUser
  if (!user) throw new Error('No user logged in')
  if (!updates.currentPassword) {
    throw new Error('Current password is required')
  }
  const credential = EmailAuthProvider.credential(user.email!, updates.currentPassword)
  await reauthenticateWithCredential(user, credential)
  if (updates.displayName) {
    await fbUpdateProfile(user, { displayName: updates.displayName })
  }
  if (updates.email) {
    await verifyBeforeUpdateEmail(user, updates.email)
  }
  if (updates.password) {
    await updatePassword(user, updates.password)
  }
  return auth.currentUser
}

// Downloads user media
export const loadMedia = async (userId: string): Promise<FirebaseItemType[]> => {
  const ref = doc(db, 'media', userId)
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data()?.media || []
  return []
}

// Stores the entire array of user media
export const saveMedia = async (userId: string, media: FirebaseItemType[]) => {
  const ref = doc(db, 'media', userId)
  await setDoc(ref, { media }, { merge: true })
}

// Updates or adds one media element
export const updateMediaItem = async (userId: string, item: FirebaseItemType) => {
  const ref = doc(db, 'media', userId)
  const snap = await getDoc(ref)
  const existing: FirebaseItemType[] = snap.exists() ? snap.data()?.media || [] : []

  const filtered = existing.filter((m) => !(m.id === item.id && m.media_type === item.media_type))
  await setDoc(ref, { media: [...filtered, item] }, { merge: true })
}

// Removes a specific media element
export const removeMediaItem = async (userId: string, item: FirebaseItemType) => {
  const ref = doc(db, 'media', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const existing: FirebaseItemType[] = snap.data()?.media || []
  const filtered = existing.filter((m) => !(m.id === item.id && m.media_type === item.media_type))
  await setDoc(ref, { media: filtered }, { merge: true })
}

//Save recommendations (master account only)
export const saveRecommended = async (media: FirebaseItemType[]) => {
  const ref = doc(db, 'recommended', 'mainId')
  await setDoc(ref, { recommended: media })
}

// //Reads recommendations
export const loadRecommended = async (): Promise<FirebaseItemType[]> => {
  const ref = doc(db, 'recommended', 'mainId')
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return snap.data()?.recommended || []
  }

  return []
}
