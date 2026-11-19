<template>
  <div
    class="user-row-card"
    :class="{ active: chatStore.activePeerUid === user.uid, blocked: isBlockedByMe }"
    @click="handleRowClick"
  >
    <div class="card-top">
      <label class="checkbox-slot" :class="{ visible: selectionMode }" @click.stop>
        <input
          type="checkbox"
          :value="user.uid"
          :checked="selected"
          :disabled="isBlockedByMe"
          @change="$emit('toggle-select', user.uid)"
        />
      </label>

      <div class="user-info-cell">
        <UserIdentityBadge :user="user" :show-online="true" :show-days="false" />

        <p v-if="lastMessage" class="last-msg">{{ lastMessage }}</p>
      </div>

      <div class="card-btns" @click.stop>
        <span v-if="unreadCount" class="unread-pill">{{ unreadCount }}</span>
        <button
          class="mini-btn profile-btn"
          :class="{ active: isProfileOpen }"
          @click="isProfileOpen = !isProfileOpen"
          :title="$t('chat.user_card_btn')"
        >
          👤
        </button>
      </div>
    </div>

    <div v-if="isProfileOpen" class="user-details-drawer" @click.stop>
      <div class="drawer-meta">
        <span>
          <strong>{{ $t('chat.role_label') }}:</strong> {{ $t(`chat.role_${user.role}`) }}
        </span>
        <span>
          <strong>{{ $t('chat.days_on_site', { days: getDaysOnSite(user.createdAt) }) }}</strong>
        </span>
      </div>

      <div class="drawer-actions">
        <button v-if="!friendship" class="drawer-btn add" @click="friendsStore.addFriend(user.uid)">
          ➕ {{ $t('chat.add_friend') }}
        </button>
        <button
          v-else-if="friendship.status === 'accepted'"
          class="drawer-btn danger"
          @click="friendsStore.declineOrRemove(friendship.id)"
        >
          ✕ {{ $t('chat.remove_friend') }}
        </button>
        <span v-else class="pending-tag">{{ $t('chat.request_pending') }}</span>

        <button v-if="!isBlockedByMe" class="drawer-btn warn" @click="handleBlock">
          🚫 {{ $t('chat.block_user') }}
        </button>
        <button v-else class="drawer-btn success" @click="handleUnblock">
          🔓 {{ $t('chat.unblock_user') }}
        </button>

        <button
          v-if="canManageRoles && user.uid !== MAIN_ACCOUNT_ID"
          class="drawer-btn admin"
          @click="toggleRightsPanel"
        >
          ⚙ {{ $t('chat.edit_rights') }}
        </button>
      </div>

      <div v-if="showRightsPanel && canManageRoles" class="rights-panel">
        <div class="role-row">
          <span>{{ $t('chat.role_label') }}:</span>
          <select v-model="editRole" @change="onRolePresetChange" class="role-select">
            <option value="user">{{ $t('chat.role_user') }}</option>
            <option value="moderator">{{ $t('chat.role_moderator') }}</option>
            <option value="admin">{{ $t('chat.role_admin') }}</option>
          </select>
        </div>

        <div class="perms-grid">
          <label v-for="(val, key) in editPerms" :key="key" class="perm-item">
            <input type="checkbox" v-model="editPerms[key]" />
            <span>{{ $t(`chat.perm_${key}`) }}</span>
          </label>
        </div>

        <div class="admin-footer-btns">
          <button class="save-rights-btn" @click="saveRights">
            {{ $t('chat.save_rights') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import { MAIN_ACCOUNT_ID } from '@/constants/env'
import type { UserPermissions, UserProfile, UserRole } from '@/types/chat'
import { getDaysOnSite, getDefaultPermissions } from '@/utils/userHelpers'
import { blockUser, unblockUser, updateUserRoleAndPermissions } from '@/api/users'
import { notificationStore } from '@/stores/notifications'
import UserIdentityBadge from './UserIdentityBadge.vue'

const props = defineProps<{
  user: UserProfile
  selectionMode: boolean
  selected: boolean
  lastMessage?: string
  unreadCount?: number
}>()

defineEmits<{
  (e: 'toggle-select', uid: string): void
}>()

const chatStore = useChatStore()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const { t } = useI18n()

const isProfileOpen = ref(false)
const showRightsPanel = ref(false)
const editRole = ref<UserRole>(props.user.role)
const editPerms = ref<UserPermissions>({
  ...getDefaultPermissions(props.user.role),
  ...props.user.permissions,
})

const isBlockedByMe = computed(() =>
  Boolean(chatStore.currentUserProfile?.blockedUsers?.includes(props.user.uid)),
)

const friendship = computed(() =>
  friendsStore.friendships.find((f) => f.users.includes(props.user.uid)),
)

const canManageRoles = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canManageRoles),
)

const toggleRightsPanel = () => {
  showRightsPanel.value = !showRightsPanel.value
  if (showRightsPanel.value) {
    editRole.value = props.user.role
    editPerms.value = {
      ...getDefaultPermissions(props.user.role),
      ...props.user.permissions,
    }
  }
}

const handleRowClick = () => {
  if (isBlockedByMe.value) {
    isProfileOpen.value = !isProfileOpen.value
    return
  }
  chatStore.openDialogWith(props.user.uid)
}

const handleBlock = async () => {
  const myUid = authStore.user?.uid
  if (!myUid) return
  await blockUser(myUid, props.user.uid)
  if (chatStore.activePeerUid === props.user.uid) chatStore.closeDialog()
}

const handleUnblock = async () => {
  const myUid = authStore.user?.uid
  if (!myUid) return
  await unblockUser(myUid, props.user.uid)
}

const onRolePresetChange = () => {
  editPerms.value = getDefaultPermissions(editRole.value)
}

const saveRights = async () => {
  await updateUserRoleAndPermissions(props.user.uid, editRole.value, editPerms.value)
  showRightsPanel.value = false
  notificationStore.success(t('notification_message.updated_profile_success'))
}
</script>
<style scoped>
.user-row-card {
  padding: 9px 11px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.58),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}
.user-row-card:hover,
.user-row-card.active {
  transform: translateY(-2px);
  border-color: var(--glass-border-bright);
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 16px 30px rgba(0, 0, 0, 0.78),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.user-row-card.blocked {
  opacity: 0.65;
  border-color: rgba(175, 25, 25, 0.5);
}
.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.checkbox-slot {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.checkbox-slot.visible {
  visibility: visible;
  opacity: 1;
}
.user-info-cell {
  flex: 1;
  min-width: 0;
}
.last-msg {
  font-size: 12px;
  color: var(--color-light-grey);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 3px;
}
.card-btns {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.mini-btn {
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  font-size: 12px;
  cursor: pointer;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.mini-btn:hover,
.mini-btn.active {
  transform: translateY(-1px);
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.mini-btn:active {
  transform: translateY(1px) scale(0.95);
}
.unread-pill {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
.user-details-drawer {
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  cursor: default;
}
.drawer-meta {
  display: flex;
  justify-content: space-between;
  color: var(--color-light-grey);
}
.drawer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.pending-tag {
  font-size: 11px;
  color: var(--color-light-grey);
  padding: 4px 8px;
  border-radius: 8px;
  background-color: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
}
.drawer-btn {
  padding: 5px 9px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.drawer-btn:hover {
  transform: translateY(-1px);
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.drawer-btn:active {
  transform: translateY(1px) scale(0.96);
}
.drawer-btn.add,
.drawer-btn.success {
  background-color: var(--glass-green);
}
.drawer-btn.danger,
.drawer-btn.warn {
  background-color: var(--glass-red-soft);
}
.drawer-btn.admin {
  background-color: var(--glass-blue);
}
.rights-panel {
  padding-top: 8px;
  border-top: 1px dashed var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 7px;
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
  border-radius: 8px;
  padding: 4px 8px;
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.role-select:hover,
.role-select:focus {
  border-color: var(--color-hover);
}
.perms-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 5px;
}
.perm-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.admin-footer-btns {
  display: flex;
  gap: 6px;
}
.save-rights-btn {
  flex: 1;
  padding: 6px;
  border-radius: 8px;
  background-color: var(--glass-green);
  border: 1px solid var(--glass-border);
  color: var(--color-white);
  font-weight: 600;
  cursor: pointer;
  box-shadow:
    0 8px 18px rgba(16, 155, 95, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  transition:
    transform 0.2s ease,
    background-color 0.25s ease;
}
.save-rights-btn:hover {
  transform: translateY(-1px);
  background-color: var(--glass-hover);
}
</style>
