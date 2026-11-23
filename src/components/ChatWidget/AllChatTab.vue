<template>
  <div class="all-chat-tab">
    <div class="chats-scroll">
      <div class="chats-section">
        <p class="section-label">🔔 {{ $t('chat.tab_system') }}</p>
        <div
          class="system-entry-card"
          :class="{ 'has-unread': totalSystemUnread > 0 }"
          @click="$emit('open-system')"
        >
          <div class="system-avatar">🔔</div>

          <div class="system-card-body">
            <div class="system-card-top">
              <p class="system-card-preview">{{ systemPreviewText }}</p>
              <span v-if="latestSystemTime" class="system-card-time">{{ latestSystemTime }}</span>
            </div>
          </div>

          <span v-if="totalSystemUnread > 0" class="unread-pill">
            {{ totalSystemUnread }}
          </span>
        </div>
      </div>

      <div v-if="groupItems.length" class="chats-section">
        <p class="section-label">👥 {{ $t('chat.group_chats') }}</p>
        <ChatCard
          v-for="item in groupItems"
          :key="item.room.id"
          :is-group="true"
          :title="item.title"
          :last-message="item.room.lastMessage"
          :updated-at="item.room.updatedAt"
          :unread="item.unread"
          @select="chatStore.openGroupRoom(item.room.id)"
        />
      </div>

      <div v-if="friendDirectItems.length" class="chats-section">
        <p class="section-label">🤝 {{ $t('chat.tab_friends') }}</p>
        <ChatCard
          v-for="item in friendDirectItems"
          :key="item.room.id"
          :title="item.title"
          :peer-user="item.peerUser"
          :last-message="item.room.lastMessage"
          :updated-at="item.room.updatedAt"
          :unread="item.unread"
          @select="item.peerUid && chatStore.openChatWith(item.peerUid)"
        />
      </div>

      <div v-if="otherDirectItems.length" class="chats-section">
        <p class="section-label">💬 {{ $t('chat.tab_all') }}</p>
        <ChatCard
          v-for="item in otherDirectItems"
          :key="item.room.id"
          :title="item.title"
          :peer-user="item.peerUser"
          :last-message="item.room.lastMessage"
          :updated-at="item.room.updatedAt"
          :unread="item.unread"
          @select="item.peerUid && chatStore.openChatWith(item.peerUid)"
        />
      </div>

      <p v-if="!allItems.length" class="empty-chats-hint">
        {{ $t('chat.select_friend_hint') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import { useMediaStore } from '@/stores/media'
import type { ChatRoom, UserProfile } from '@/types/chat'
import ChatCard from './ChatCard.vue'

defineEmits<{
  (e: 'open-system'): void
}>()

interface ChatSummaryItem {
  room: ChatRoom
  peerUid: string | null
  peerUser: UserProfile | null
  title: string
  unread: number
}

const chatStore = useChatStore()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const mediaStore = useMediaStore()
const { t } = useI18n()

const totalSystemUnread = computed(() => chatStore.systemTabUnreadCount)

const latestSystemMessage = computed(() => {
  if (!chatStore.systemMessages.length) return null
  return [...chatStore.systemMessages].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0]
})

const latestSystemTime = computed(() => {
  const ts = latestSystemMessage.value?.createdAt
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const systemPreviewText = computed(() => {
  if (latestSystemMessage.value) {
    return latestSystemMessage.value.title || latestSystemMessage.value.text
  }
  const releases = mediaStore.releaseList()
  if (releases.length) {
    return `${t('modal_release.title')}: ${releases.length}`
  }
  return t('notification_message.release_empty_info')
})

const resolveUser = (uid: string): UserProfile | null => {
  return chatStore.allUsers.find((u) => u.uid === uid) || friendsStore.profilesMap[uid] || null
}

const friendUidSet = computed(() => {
  return new Set(friendsStore.acceptedFriends.map((f) => f.friendUid))
})

const allItems = computed<ChatSummaryItem[]>(() => {
  const myUid = authStore.user?.uid
  if (!myUid) return []

  return [...chatStore.chats]
    .filter((r) => {
      if (r.isGroup) return r.participants.length >= 2
      const clearedAt = r.clearedAt?.[myUid] || 0
      if (clearedAt > 0 && (r.updatedAt || 0) <= clearedAt) return false
      return Boolean(r.lastMessage?.trim())
    })
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .map((room) => {
      const unread = room.unreadCount?.[myUid] || 0

      if (room.isGroup) {
        const title =
          room.groupTitle ||
          room.participants
            .filter((id) => id !== myUid)
            .map((id) => resolveUser(id)?.displayName || id.slice(0, 6))
            .join(', ')

        return { room, peerUid: null, peerUser: null, title, unread }
      }

      const peerUid = room.participants.find((id) => id !== myUid) || null
      const peerUser = peerUid ? resolveUser(peerUid) : null
      const title = peerUser?.displayName || (peerUid ? peerUid.slice(0, 6) : 'User')

      return { room, peerUid, peerUser, title, unread }
    })
})

const groupItems = computed(() => allItems.value.filter((i) => i.room.isGroup))
const friendDirectItems = computed(() =>
  allItems.value.filter((i) => !i.room.isGroup && i.peerUid && friendUidSet.value.has(i.peerUid)),
)
const otherDirectItems = computed(() =>
  allItems.value.filter(
    (i) => !i.room.isGroup && (!i.peerUid || !friendUidSet.value.has(i.peerUid)),
  ),
)
</script>
<style scoped>
.all-chat-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chats-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.system-entry-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: all 0.2s ease;
}

.system-entry-card:hover {
  border-color: var(--color-hover);
  background-color: rgba(159, 27, 25, 0.16);
}

.system-entry-card.has-unread {
  border-color: var(--color-hover);
  box-shadow:
    0 0 12px rgba(255, 61, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.system-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--glass-red-soft);
  border: 1px solid var(--glass-border-bright);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.system-card-body {
  flex: 1;
  min-width: 0;
}

.system-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.system-card-time {
  font-size: 11px;
  color: var(--color-light-grey);
  flex-shrink: 0;
}

.system-card-preview {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-pill {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
}

.empty-chats-hint {
  margin: auto;
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--color-light-grey);
}

.chats-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  margin: 2px 2px 0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-light-grey);
}
</style>
