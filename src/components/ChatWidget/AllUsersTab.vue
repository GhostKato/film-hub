<template>
  <div class="users-tab-wrap">
    <div class="users-toolbar">
      <UserSearchInput v-model="filterQuery" />

      <BulkSelectionBar
        :selected-count="selectedUids.length"
        :is-all-selected="isAllSelected"
        :allow-broadcast="canUseBroadcast"
        :can-send-system="canSendSystem"
        :is-submitting="isSending"
        @create-group="handleCreateGroupChat"
        @toggle-all="handleToggleSelectButton"
        @clear="selectedUids = []"
        @send-broadcast="submitBroadcast"
      />
    </div>

    <div class="scroll-area">
      <p v-if="!filteredUsers.length" class="hint-text">{{ $t('media_list.not_found') }}</p>

      <UserCard
        v-for="user in filteredUsers"
        :key="user.uid"
        :user="user"
        :selected="selectedUids.includes(user.uid)"
        :last-message="getLastMessage(user.uid)"
        :unread-count="getUnreadForUser(user.uid)"
        @toggle-select="toggleUserSelection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { getChatId } from '@/utils/userHelpers'
import { notificationStore } from '@/stores/notifications'
import UserSearchInput from './UserSearchInput.vue'
import UserCard from './UserCard.vue'
import BulkSelectionBar from './BulkSelectionBar.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { t } = useI18n()

const filterQuery = ref('')
const selectedUids = ref<string[]>([])
const isSending = ref(false)

const canUseBroadcast = computed(() => {
  const me = chatStore.currentUserProfile
  if (!me) return false
  return (
    me.role !== 'user' ||
    Boolean(me.permissions?.canSendSystemMessages) ||
    Boolean(me.permissions?.canSeeAllUsers)
  )
})

const canSendSystem = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions?.canSendSystemMessages),
)

const filteredUsers = computed(() => {
  const q = filterQuery.value.trim().toLowerCase()
  return chatStore.allUsers.filter((u) => {
    if (!q) return true
    return u.displayNameLower.includes(q)
  })
})

const selectableUsers = computed(() =>
  filteredUsers.value.filter((u) => !chatStore.currentUserProfile?.blockedUsers?.includes(u.uid)),
)

const isAllSelected = computed(
  () =>
    selectableUsers.value.length > 0 && selectedUids.value.length === selectableUsers.value.length,
)

const toggleUserSelection = (uid: string) => {
  const idx = selectedUids.value.indexOf(uid)
  if (idx === -1) selectedUids.value.push(uid)
  else selectedUids.value.splice(idx, 1)
}

const handleToggleSelectButton = () => {
  if (isAllSelected.value) {
    selectedUids.value = []
  } else {
    selectedUids.value = selectableUsers.value.map((u) => u.uid)
  }
}

const handleCreateGroupChat = async () => {
  if (selectedUids.value.length < 2) return
  isSending.value = true
  try {
    await chatStore.startChatWithSelected([...selectedUids.value])
    selectedUids.value = []
  } finally {
    isSending.value = false
  }
}

const submitBroadcast = async (payload: {
  type: 'direct' | 'system'
  title: string
  text: string
  isAnonymous: boolean
}) => {
  if (!selectedUids.value.length || !payload.text.trim()) return
  isSending.value = true
  try {
    if (payload.type === 'system' && canSendSystem.value) {
      await chatStore.sendSystemBroadcast({
        recipientUids: selectedUids.value,
        title: payload.title,
        text: payload.text,
        isAnonymous: payload.isAnonymous,
      })
    } else {
      await chatStore.sendDirectBroadcast(selectedUids.value, payload.text)
    }
    notificationStore.success(t('chat.broadcast_sent'))
    selectedUids.value = []
  } finally {
    isSending.value = false
  }
}

const getUnreadForUser = (targetUid: string) => {
  const myUid = authStore.user?.uid
  if (!myUid) return 0
  const room = chatStore.chats.find((c) => c.id === getChatId(myUid, targetUid))
  return room?.unreadCount?.[myUid] || 0
}

const getLastMessage = (targetUid: string) => {
  const myUid = authStore.user?.uid
  if (!myUid) return ''
  const room = chatStore.chats.find((c) => c.id === getChatId(myUid, targetUid))
  return room?.lastMessage || ''
}
</script>

<style scoped>
.users-tab-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.users-toolbar {
  padding: 10px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hint-text {
  font-size: 13px;
  color: var(--color-light-grey);
  text-align: center;
  padding: 10px;
}
</style>
