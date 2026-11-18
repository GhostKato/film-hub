import { db } from '@/firebase'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import type { FriendshipItem } from '@/types/chat'
import { getChatId } from '@/utils/userHelpers'

export const sendFriendRequest = async (fromUid: string, toUid: string) => {
  const id = getChatId(fromUid, toUid)
  const pair = [fromUid, toUid].sort() as [string, string]
  const item: FriendshipItem = {
    id,
    users: pair,
    requesterId: fromUid,
    status: 'pending',
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'friendships', id), item)
}

export const acceptFriendRequest = async (friendshipId: string) => {
  await updateDoc(doc(db, 'friendships', friendshipId), {
    status: 'accepted',
  })
}

export const removeFriendship = async (friendshipId: string) => {
  await deleteDoc(doc(db, 'friendships', friendshipId))
}

export const subscribeFriendships = (uid: string, callback: (items: FriendshipItem[]) => void) => {
  const q = query(collection(db, 'friendships'), where('users', 'array-contains', uid))
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => d.data() as FriendshipItem)
    callback(list)
  })
}
