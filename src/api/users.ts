import { db } from '@/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type { UserPermissions, UserProfile, UserRole } from '@/types/chat'
import { getDefaultPermissions, resolveInitialRole } from '@/utils/userHelpers'
import { MAIN_ACCOUNT_ID } from '@/constants/env'

export const syncUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  const createdTime = firebaseUser.metadata.creationTime
    ? new Date(firebaseUser.metadata.creationTime).getTime()
    : Date.now()

  const fallbackName = firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'
  const displayName = firebaseUser.displayName || fallbackName || 'User'

  if (!snap.exists()) {
    const role = resolveInitialRole(firebaseUser.uid)
    const profile: UserProfile = {
      uid: firebaseUser.uid,
      displayName,
      displayNameLower: displayName.toLowerCase(),
      email: firebaseUser.email || '',
      role,
      permissions: getDefaultPermissions(role),
      isOnline: true,
      hideOnline: false,
      lastSeen: Date.now(),
      createdAt: createdTime,
      updatedAt: Date.now(),
      isBlocked: false,
      isDeleted: false,
      blockedUsers: [],
    }
    await setDoc(ref, profile)
    return profile
  }

  const existing = snap.data() as UserProfile
  const isOwner = firebaseUser.uid === MAIN_ACCOUNT_ID
  const updatedFields: Partial<UserProfile> = {
    displayName,
    displayNameLower: displayName.toLowerCase(),
    email: firebaseUser.email || existing.email,
    isOnline: true,
    lastSeen: Date.now(),
    updatedAt: Date.now(),
    ...(isOwner ? { role: 'owner', permissions: getDefaultPermissions('owner') } : {}),
  }

  await updateDoc(ref, updatedFields)
  return { ...existing, ...updatedFields }
}

export const updateOnlineStatus = async (uid: string, isOnline: boolean) => {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { isOnline, lastSeen: Date.now() }).catch(() => {})
}

export const toggleHideOnline = async (uid: string, hideOnline: boolean) => {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { hideOnline, updatedAt: Date.now() })
}

export const blockUser = async (currentUid: string, targetUid: string) => {
  if (targetUid === MAIN_ACCOUNT_ID) return
  await updateDoc(doc(db, 'users', currentUid), {
    blockedUsers: arrayUnion(targetUid),
    updatedAt: Date.now(),
  })
}

export const unblockUser = async (currentUid: string, targetUid: string) => {
  await updateDoc(doc(db, 'users', currentUid), {
    blockedUsers: arrayRemove(targetUid),
    updatedAt: Date.now(),
  })
}
export const searchUsersByNickname = async (
  searchQuery: string,
  currentUid: string,
): Promise<UserProfile[]> => {
  const clean = searchQuery.trim().toLowerCase()
  if (clean.length < 3) return []

  const q = query(
    collection(db, 'users'),
    where('displayNameLower', '>=', clean),
    where('displayNameLower', '<=', clean + '\uf8ff'),
    limit(15),
  )

  const snap = await getDocs(q)
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => u.uid !== currentUid && !u.isDeleted && !u.blockedUsers?.includes(currentUid))
}

export const subscribeToUser = (uid: string, callback: (user: UserProfile | null) => void) => {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null)
  })
}

export const subscribeAllUsers = (callback: (users: UserProfile[]) => void) => {
  return onSnapshot(collection(db, 'users'), (snap) => {
    const list = snap.docs
      .map((d) => d.data() as UserProfile)
      .filter((u) => !u.isDeleted)
      .sort((a, b) => b.createdAt - a.createdAt)
    callback(list)
  })
}

export const updateUserRoleAndPermissions = async (
  targetUid: string,
  role: UserRole,
  permissions: UserPermissions,
) => {
  if (targetUid === MAIN_ACCOUNT_ID) return
  const ref = doc(db, 'users', targetUid)
  await updateDoc(ref, { role, permissions, updatedAt: Date.now() })
}

export const setUserBlockedStatus = async (targetUid: string, isBlocked: boolean) => {
  if (targetUid === MAIN_ACCOUNT_ID) return
  await updateDoc(doc(db, 'users', targetUid), { isBlocked, updatedAt: Date.now() })
}
