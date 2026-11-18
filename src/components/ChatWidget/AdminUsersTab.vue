<template>
  <div class="admin-tab-wrap">
    <div class="admin-toolbar">
      <input
        v-model="filterQuery"
        type="text"
        class="glass-input"
        :placeholder="$t('chat.filter_users_placeholder')"
      />
      <div class="bulk-actions">
        <button class="mini-btn" @click="toggleSelectAll">
          {{
            selectedUids.length === filteredUsers.length
              ? $t('chat.unselect_all')
              : $t('chat.select_all')
          }}
        </button>
        <button
          v-if="selectedUids.length && canSendSystem"
          class="mini-btn accent"
          @click="showBroadcastForm = !showBroadcastForm"
        >
          📢 ({{ selectedUids.length }})
        </button>
      </div>
    </div>

    <div v-if="showBroadcastForm" class="broadcast-box">
      <input
        v-model="broadcastTitle"
        type="text"
        class="glass-input"
        :placeholder="$t('chat.broadcast_title_placeholder')"
      />
      <textarea
        v-model="broadcastText"
        rows="2"
        class="glass-input"
        :placeholder="$t('chat.broadcast_text_placeholder')"
      ></textarea>
      <label class="checkbox-row">
        <input type="checkbox" v-model="isAnonymous" />
        <span>{{ $t('chat.send_anonymously') }}</span>
      </label>
      <button class="send-broadcast-btn" @click="submitBroadcast" :disabled="!broadcastText.trim()">
        {{ $t('chat.send_to_selected', { count: selectedUids.length }) }}
      </button>
    </div>

    <div class="scroll-area">
      <div v-for="user in filteredUsers" :key="user.uid" class="admin-user-card">
        <div class="card-top">
          <label class="select-check">
            <input type="checkbox" :value="user.uid" v-model="selectedUids" />
          </label>

          <div class="user-info-cell">
            <UserIdentityBadge :user="user" />
          </div>

          <div class="card-btns">
            <button
              v-if="!isRelatedWithUser(user.uid)"
              class="mini-btn"
              @click="friendsStore.addFriend(user.uid)"
              :title="$t('chat.add_friend')"
            >
              ➕
            </button>
            <button
              class="mini-btn"
              @click="chatStore.openDialogWith(user.uid)"
              :title="$t('chat.write_direct')"
            >
              💬
            </button>
            <button
              v-if="canManageRoles && user.uid !== MAIN_ACCOUNT_ID"
              class="mini-btn"
              @click="
                editingUser =
                  editingUser?.uid === user.uid
                    ? null
                    : { ...user, permissions: { ...user.permissions } }
              "
              :title="$t('chat.edit_rights')"
            >
              ⚙
            </button>
            <button
              v-if="canDeleteUsers && user.uid !== MAIN_ACCOUNT_ID"
              class="mini-btn danger"
              @click="confirmDeleteUser(user)"
              :title="$t('chat.delete_user_db')"
            >
              🗑
            </button>
          </div>
        </div>

        <div v-if="editingUser && editingUser.uid === user.uid" class="rights-panel">
          <div class="role-row">
            <span>{{ $t('chat.role_label') }}:</span>
            <select v-model="editingUser.role" @change="onRolePresetChange" class="role-select">
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="perms-grid">
            <label v-for="(val, key) in editingUser.permissions" :key="key" class="perm-item">
              <input type="checkbox" v-model="editingUser.permissions[key]" />
              <span>{{ key }}</span>
            </label>
          </div>

          <button class="save-rights-btn" @click="saveUserRights">
            {{ $t('chat.save_rights') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import { MAIN_ACCOUNT_ID } from '@/constants/env'
import type { UserProfile } from '@/types/chat'
import { getDefaultPermissions } from '@/utils/userHelpers'
import { deleteUserAccountData, updateUserRoleAndPermissions } from '@/api/users'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'
import UserIdentityBadge from './UserIdentityBadge.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const { t } = useI18n()

const filterQuery = ref('')
const selectedUids = ref<string[]>([])
const showBroadcastForm = ref(false)
const broadcastTitle = ref('')
const broadcastText = ref('')
const isAnonymous = ref(true)
const editingUser = ref<UserProfile | null>(null)

const canManageRoles = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canManageRoles),
)
const canSendSystem = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canSendSystemMessages),
)
const canDeleteUsers = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canBanOrDeleteUsers),
)

const filteredUsers = computed(() => {
  const q = filterQuery.value.trim().toLowerCase()
  return chatStore.allUsers.filter((u) => {
    if (u.uid === authStore.user?.uid) return false
    if (!q) return true
    return u.displayNameLower.includes(q) || u.email.toLowerCase().includes(q)
  })
})

const isRelatedWithUser = (targetUid: string) =>
  friendsStore.friendships.some((f) => f.users.includes(targetUid))

const toggleSelectAll = () => {
  if (selectedUids.value.length === filteredUsers.value.length) {
    selectedUids.value = []
  } else {
    selectedUids.value = filteredUsers.value.map((u) => u.uid)
  }
}

const onRolePresetChange = () => {
  if (!editingUser.value) return
  editingUser.value.permissions = getDefaultPermissions(editingUser.value.role)
}

const saveUserRights = async () => {
  if (!editingUser.value) return
  await updateUserRoleAndPermissions(
    editingUser.value.uid,
    editingUser.value.role,
    editingUser.value.permissions,
  )
  editingUser.value = null
  notificationStore.success(t('notification_message.updated_profile_success'))
}

const submitBroadcast = async () => {
  if (!selectedUids.value.length || !broadcastText.value.trim()) return
  await chatStore.sendSystemBroadcast({
    recipientUids: selectedUids.value,
    title: broadcastTitle.value,
    text: broadcastText.value,
    isAnonymous: isAnonymous.value,
  })
  broadcastTitle.value = ''
  broadcastText.value = ''
  showBroadcastForm.value = false
  selectedUids.value = []
  notificationStore.success(t('chat.broadcast_sent'))
}

const confirmDeleteUser = async (user: UserProfile) => {
  if (!window.confirm(t('chat.confirm_delete_user', { name: user.displayName }))) return
  await deleteUserAccountData(user.uid)
  notificationStore.removed(t('chat.user_deleted_notice'))
}
</script>

<style scoped>
.admin-tab-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.admin-toolbar {
  padding: 10px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bulk-actions {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.glass-input {
  width: 100%;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-white);
  font-size: 13px;
  outline: none;
}
.broadcast-box {
  padding: 10px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.send-broadcast-btn,
.save-rights-btn {
  padding: 6px 10px;
  border-radius: 8px;
  background-color: var(--glass-red);
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  cursor: pointer;
  font-weight: 600;
}
.send-broadcast-btn:hover,
.save-rights-btn:hover {
  background-color: var(--glass-hover);
}
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.admin-user-card {
  padding: 8px 10px;
  border-radius: 10px;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card-btns {
  display: flex;
  gap: 4px;
}
.mini-btn {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  font-size: 12px;
  cursor: pointer;
}
.mini-btn:hover {
  background-color: var(--glass-hover);
}
.mini-btn.accent {
  background-color: var(--glass-blue);
}
.mini-btn.danger:hover {
  background-color: var(--glass-red);
}
.rights-panel {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}
.role-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.role-select {
  background-color: var(--glass-modal);
  color: var(--color-white);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 3px 6px;
}
.perms-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
}
.perm-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
