<template>
  <div
    class="user-card"
    :class="{ active: chatStore.activePeerUid === user.uid, blocked: isBlockedByMe }"
    @click="handleRowClick"
  >
    <div class="card-top">
      <label v-if="showCheckbox !== false" class="custom-red-checkbox" @click.stop>
        <input
          type="checkbox"
          :checked="selected"
          :disabled="isBlockedByMe"
          @change="$emit('toggle-select', user.uid)"
        />
        <span class="checkmark"></span>
      </label>

      <div class="user-info-cell">
        <UserBadge :user="user" :show-online="true" :show-days="false" />

        <p v-if="lastMessage" class="last-msg">{{ lastMessage }}</p>
      </div>

      <div class="card-btns" @click.stop>
        <span v-if="unreadCount" class="unread-pill">{{ unreadCount }}</span>
        <button
          class="mini-btn red-glass-btn profile-btn"
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
        <span class="last-seen-slot">
          <template v-if="!isVisibleOnline && formattedLastSeen">
            {{ $t('chat.last_seen_at', { time: formattedLastSeen }) }}
          </template>
        </span>

        <span class="days-on-site-slot">
          <strong>{{ $t('chat.days_on_site', { days: getDaysOnSite(user.createdAt) }) }}</strong>
        </span>
      </div>

      <div class="drawer-actions">
        <div class="top-actions-row">
          <button
            v-if="!friendship"
            class="drawer-btn red-glass-btn"
            @click="friendsStore.addFriend(user.uid)"
          >
            ➕ {{ $t('chat.add_friend') }}
          </button>
          <button
            v-else-if="friendship.status === 'accepted'"
            class="drawer-btn red-glass-btn"
            @click="friendsStore.declineOrRemove(friendship.id)"
          >
            ✕ {{ $t('chat.remove_friend') }}
          </button>
          <span v-else class="pending-tag">{{ $t('chat.request_pending') }}</span>

          <template
            v-if="
              user.uid !== MAIN_ACCOUNT_ID &&
              user.role !== 'owner' &&
              (isMeOwner || !user.permissions?.hasImmunity)
            "
          >
            <button v-if="!isBlockedByMe" class="drawer-btn red-glass-btn" @click="handleBlock">
              🚫 {{ $t('chat.block_user') }}
            </button>
            <button v-else class="drawer-btn red-glass-btn active" @click="handleUnblock">
              🔓 {{ $t('chat.unblock_user') }}
            </button>
          </template>
        </div>

        <button
          v-if="canEditTargetRights"
          class="drawer-btn red-glass-btn full-width-btn"
          @click="toggleRightsPanel"
        >
          ⚙ {{ $t('chat.edit_rights') }}
        </button>
      </div>

      <div v-if="showRightsPanel && canEditTargetRights" class="rights-panel">
        <div class="role-row">
          <span>{{ $t('chat.role_label') }}:</span>
          <select v-model="editRole" @change="onRolePresetChange" class="role-select">
            <option value="user">{{ $t('chat.role_user') }}</option>
            <option value="moderator">{{ $t('chat.role_moderator') }}</option>
            <option value="admin">{{ $t('chat.role_admin') }}</option>
          </select>
        </div>

        <div class="perms-grid">
          <label v-for="key in visiblePermissionKeys" :key="key" class="perm-item">
            <input type="checkbox" v-model="editPerms[key]" />
            <span>{{ $t(`chat.perm_${key}`) }}</span>
          </label>
        </div>

        <button class="save-rights-btn red-glass-btn full-width-btn" @click="saveRights">
          {{ $t('chat.save_rights') }}
        </button>
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
import UserBadge from './UserBadge.vue'

const props = withDefaults(
  defineProps<{
    user: UserProfile
    selected?: boolean
    showCheckbox?: boolean
    lastMessage?: string
    unreadCount?: number
  }>(),
  {
    showCheckbox: true,
  },
)

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

const isMeOwner = computed(() => {
  const me = chatStore.currentUserProfile
  return me?.role === 'owner' || me?.uid === MAIN_ACCOUNT_ID
})

const canManageRoles = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canManageRoles),
)

const canEditTargetRights = computed(() => {
  if (!canManageRoles.value || props.user.uid === MAIN_ACCOUNT_ID) return false
  if (isMeOwner.value) return true
  if (props.user.role === 'owner' || props.user.permissions?.hasImmunity) return false
  return true
})

const visiblePermissionKeys = computed<(keyof UserPermissions)[]>(() => {
  const baseKeys: (keyof UserPermissions)[] = [
    'canSeeAllUsers',
    'canSendSystemMessages',
    'canManageRoles',
    'canUseStealth',
  ]
  if (isMeOwner.value) {
    baseKeys.push('hasImmunity')
  }
  return baseKeys
})

const isVisibleOnline = computed(() => {
  if (!props.user.isOnline) return false
  const isFresh = Date.now() - (props.user.lastSeen || 0) < 75000
  if (!isFresh) return false
  if (!props.user.hideOnline) return true
  return isMeOwner.value
})

const formattedLastSeen = computed(() => {
  if (!props.user.lastSeen) return ''
  return new Date(props.user.lastSeen).toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

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
  const currentImmunity = Boolean(editPerms.value.hasImmunity)
  editPerms.value = {
    ...getDefaultPermissions(editRole.value),
    ...(isMeOwner.value ? { hasImmunity: currentImmunity } : {}),
  }
}

const saveRights = async () => {
  await updateUserRoleAndPermissions(
    props.user.uid,
    editRole.value,
    editPerms.value,
    chatStore.currentUserProfile,
  )
  showRightsPanel.value = false
  notificationStore.success(t('notification_message.updated_profile_success'))
}
</script>

<style scoped>
.user-card {
  padding: 9px 11px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.58),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-card:hover,
.user-card.active {
  border-color: var(--color-hover);
  background-color: rgba(159, 27, 25, 0.16);
}

.user-card.blocked {
  opacity: 0.65;
  border-color: rgba(175, 25, 25, 0.5);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 9px;
}

.custom-red-checkbox {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}

.custom-red-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-red-checkbox .checkmark {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1px solid var(--glass-border-bright);
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
}

.custom-red-checkbox:hover input:not(:disabled) ~ .checkmark {
  border-color: var(--color-hover);
  box-shadow: 0 0 8px rgba(255, 61, 0, 0.45);
}

.custom-red-checkbox input:checked ~ .checkmark {
  background-color: var(--glass-red);
  border-color: var(--color-hover);
  box-shadow: 0 0 10px rgba(255, 61, 0, 0.55);
}

.custom-red-checkbox input:checked ~ .checkmark::after {
  content: '✓';
  color: var(--color-white);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.custom-red-checkbox input:disabled ~ .checkmark {
  opacity: 0.35;
  cursor: not-allowed;
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

.unread-pill {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
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
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--color-light-grey);
}

.days-on-site-slot {
  margin-left: auto;
  text-align: right;
  white-space: nowrap;
}

.drawer-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.top-actions-row {
  display: flex;
  gap: 6px;
  width: 100%;
}

.top-actions-row > * {
  flex: 1;
  width: 100%;
}

.full-width-btn {
  width: 100%;
}

.red-glass-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-red-soft);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: all 0.2s ease;
}

.red-glass-btn:hover,
.red-glass-btn.active {
  background-color: var(--glass-red);
  border-color: var(--color-hover);
}

.pending-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--color-light-grey);
  padding: 6px 8px;
  border-radius: 8px;
  background-color: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
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

.perm-item input {
  accent-color: var(--color-hover);
}
</style>
