<template>
  <div v-if="user">
    <div class="top-row">
      <span v-if="showOnline" class="status-dot" :class="{ online: isVisibleOnline }"></span>
      <span class="nickname">{{ user.displayName }}</span>
      <span v-if="user.role !== 'user'" class="role-badge" :class="`role-${user.role}`">
        {{ roleLabel }}
      </span>
    </div>
    <span v-if="showDays" class="days-badge">
      {{ $t('chat.days_on_site', { days: daysCount }) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UserProfile } from '@/types/chat'
import { getDaysOnSite } from '@/utils/userHelpers'
import { useChatStore } from '@/stores/chat'

const props = withDefaults(
  defineProps<{
    user: UserProfile
    showOnline?: boolean
    showDays?: boolean
  }>(),
  {
    showOnline: true,
    showDays: true,
  },
)

const { t } = useI18n()
const chatStore = useChatStore()

const daysCount = computed(() => getDaysOnSite(props.user.createdAt))

const isVisibleOnline = computed(() => {
  if (!props.user.isOnline) return false
  if (!props.user.hideOnline) return true
  return Boolean(chatStore.currentUserProfile?.permissions.canSeeAllUsers)
})

const roleLabel = computed(() => {
  switch (props.user.role) {
    case 'owner':
      return `👑 ${t('chat.role_owner')}`
    case 'admin':
      return `🛡️ ${t('chat.role_admin')}`
    case 'moderator':
      return `⚡ ${t('chat.role_moderator')}`
    default:
      return ''
  }
})
</script>

<style scoped>
.identity-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.top-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-grey);
  flex-shrink: 0;
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}
.status-dot.online {
  background-color: #10b981;
  box-shadow: 0 0 8px var(--color-shadow-green);
}
.nickname {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.role-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(8px);
  white-space: nowrap;
}
.role-owner {
  background-color: var(--glass-red);
  box-shadow: 0 0 10px rgba(159, 27, 25, 0.5);
}
.role-admin {
  background-color: var(--glass-blue);
  box-shadow: 0 0 10px rgba(25, 95, 215, 0.45);
}
.role-moderator {
  background-color: var(--glass-green);
  box-shadow: 0 0 10px rgba(16, 165, 100, 0.45);
}
.days-badge {
  font-size: 11px;
  color: var(--color-light-grey);
  opacity: 0.85;
}
</style>
