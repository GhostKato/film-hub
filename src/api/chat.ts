import { db } from '@/firebase'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  increment,
  writeBatch,
} from 'firebase/firestore'
import type {
  ChatMessage,
  ChatRoom,
  SharedMediaCard,
  SystemNotificationItem,
  UserProfile,
} from '@/types/chat'
import { getChatId } from '@/utils/userHelpers'

export const sendDirectMessage = async (params: {
  sender: UserProfile
  recipientUid: string
  text: string
  mediaCard?: SharedMediaCard
}) => {
  const { sender, recipientUid, text, mediaCard } = params
  const chatId = getChatId(sender.uid, recipientUid)
  const chatRef = doc(db, 'chats', chatId)
  const chatSnap = await getDoc(chatRef)

  const previewText = text.trim() || (mediaCard ? `🎬 ${mediaCard.title}` : '')

  if (!chatSnap.exists()) {
    const newRoom: ChatRoom = {
      id: chatId,
      participants: [sender.uid, recipientUid].sort(),
      lastMessage: previewText,
      lastSenderId: sender.uid,
      updatedAt: Date.now(),
      unreadCount: {
        [sender.uid]: 0,
        [recipientUid]: 1,
      },
      typing: {},
      clearedAt: {},
    }
    await setDoc(chatRef, newRoom)
  } else {
    await updateDoc(chatRef, {
      lastMessage: previewText,
      lastSenderId: sender.uid,
      updatedAt: Date.now(),
      [`unreadCount.${recipientUid}`]: increment(1),
    })
  }

  const msgData: Omit<ChatMessage, 'id'> = {
    senderId: sender.uid,
    senderName: sender.displayName,
    senderRole: sender.role,
    text: text.trim(),
    ...(mediaCard ? { mediaCard } : {}),
    deletedFor: [],
    readBy: [sender.uid],
    createdAt: Date.now(),
  }

  await addDoc(collection(db, 'chats', chatId, 'messages'), msgData)
}

export const sendMediaRecommendationBulk = async (params: {
  sender: UserProfile
  recipientUids: string[]
  mediaCard: SharedMediaCard
  comment?: string
}) => {
  const { sender, recipientUids, mediaCard, comment } = params
  for (const uid of recipientUids) {
    await sendDirectMessage({
      sender,
      recipientUid: uid,
      text: comment?.trim() || '',
      mediaCard,
    })
  }
}

export const sendSystemMessageBulk = async (params: {
  sender: UserProfile
  recipientUids: string[]
  title: string
  text: string
  isAnonymous: boolean
  mediaCard?: SharedMediaCard
}) => {
  const { sender, recipientUids, title, text, isAnonymous, mediaCard } = params
  const batch = writeBatch(db)

  for (const uid of recipientUids) {
    const itemRef = doc(collection(db, 'system_messages', uid, 'items'))
    const payload: Omit<SystemNotificationItem, 'id'> = {
      type: mediaCard ? 'media_recommendation' : 'admin_notice',
      title: title.trim(),
      text: text.trim(),
      ...(isAnonymous ? {} : { senderName: sender.displayName, senderRole: sender.role }),
      isAnonymous,
      ...(mediaCard ? { mediaCard } : {}),
      isRead: false,
      createdAt: Date.now(),
    }
    batch.set(itemRef, payload)
  }

  await batch.commit()
}

export const subscribeUserChats = (uid: string, callback: (chats: ChatRoom[]) => void) => {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', uid))
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs
      .map((d) => d.data() as ChatRoom)
      .sort((a, b) => b.updatedAt - a.updatedAt)
    callback(rooms)
  })
}

export const subscribeChatMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
) => {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ChatMessage, 'id'>),
    }))
    callback(msgs)
  })
}

export const markChatAsRead = async (chatId: string, uid: string) => {
  const chatRef = doc(db, 'chats', chatId)
  const snap = await getDoc(chatRef)
  if (!snap.exists()) return
  await updateDoc(chatRef, {
    [`unreadCount.${uid}`]: 0,
  })
}

export const clearChatHistoryForUser = async (chatId: string, uid: string) => {
  const chatRef = doc(db, 'chats', chatId)
  const snap = await getDoc(chatRef)
  if (!snap.exists()) return
  await updateDoc(chatRef, {
    [`clearedAt.${uid}`]: Date.now(),
    [`unreadCount.${uid}`]: 0,
  })
}

export const setTypingStatus = async (chatId: string, uid: string, isTyping: boolean) => {
  const chatRef = doc(db, 'chats', chatId)
  const snap = await getDoc(chatRef)
  if (!snap.exists()) return
  await updateDoc(chatRef, {
    [`typing.${uid}`]: isTyping,
  }).catch(() => {})
}

export const deleteMessageForMe = async (chatId: string, messageId: string, uid: string) => {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
    deletedFor: arrayUnion(uid),
  })
}

export const deleteMessageForEveryone = async (chatId: string, messageId: string) => {
  await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId))
}

export const subscribeSystemMessages = (
  uid: string,
  callback: (items: SystemNotificationItem[]) => void,
) => {
  const q = query(collection(db, 'system_messages', uid, 'items'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SystemNotificationItem, 'id'>),
    }))
    callback(list)
  })
}

export const markSystemMessageRead = async (uid: string, itemId: string) => {
  await updateDoc(doc(db, 'system_messages', uid, 'items', itemId), { isRead: true })
}

export const deleteSystemMessage = async (uid: string, itemId: string) => {
  await deleteDoc(doc(db, 'system_messages', uid, 'items', itemId))
}
