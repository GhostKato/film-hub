<template>
  <div class="top-row">
    <span v-if="showOnline" class="status-dot" :class="{ online: isVisibleOnline }"></span>

    <span class="nickname">{{ user?.displayName }}</span>

    <span v-if="isFeaturedCinephile" class="cinephile-star" :title="$t('chat.cinephile_badge')">
      ⭐
    </span>

    <span v-if="user" class="role-badge" :class="`role-${user.role}`">
      {{ roleLabel }}
    </span>
  </div>

  <span v-if="showDays" class="days-badge">
    <template v-if="isVisibleOnline">
      {{ $t('chat.days_on_site', { days: daysCount }) }} • {{ $t('chat.online') }}
    </template>
    <template v-else>
      {{ $t('chat.last_seen_at', { time: formattedLastSeen }) }}
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UserProfile } from '@/types/chat'
import { getDaysOnSite, getRoleIcon, getRoleTranslationKey } from '@/utils/userHelpers'
import { useChatStore } from '@/stores/chat'
import { useMediaStore } from '@/stores/media'
import { MAIN_ACCOUNT_ID } from '@/constants/env'

const props = withDefaults(
  defineProps<{
    user?: UserProfile
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
const mediaStore = useMediaStore()

const isFeaturedCinephile = computed(
  () => Boolean(props.user?.uid) && props.user?.uid === mediaStore.featuredCinephileUid,
)

const now = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tickTimer = setInterval(() => {
    now.value = Date.now()
  }, 15000)
})

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
})

const daysCount = computed(() => (props.user ? getDaysOnSite(props.user.createdAt) : 0))

const isVisibleOnline = computed(() => {
  if (!props.user?.isOnline) return false
  const isFresh = now.value - (props.user.lastSeen || 0) < 75000
  if (!isFresh) return false
  if (!props.user.hideOnline) return true

  const me = chatStore.currentUserProfile
  return me?.role === 'owner' || me?.uid === MAIN_ACCOUNT_ID
})

const formattedLastSeen = computed(() => {
  if (!props.user?.lastSeen) return ''
  return new Date(props.user.lastSeen).toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const roleLabel = computed(() => {
  const role = props.user?.role
  if (!role) return ''
  return `${getRoleIcon(role)} ${t(getRoleTranslationKey(role))}`
})
</script>
<style scoped>
.identity-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.top-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-grey);
  border: 1px solid rgba(255, 255, 255, 0.22);
  flex-shrink: 0;
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}
.status-dot.online {
  background-color: #10b981;
  border-color: rgba(255, 255, 255, 0.65);
  box-shadow: 0 0 10px var(--color-shadow-green);
}
.nickname {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.75);
}
.role-badge {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(8px);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
  white-space: nowrap;
}
.role-owner,
.role-superadmin {
  background-color: var(--glass-red);
  box-shadow:
    0 4px 12px rgba(159, 27, 25, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.role-admin {
  background-color: var(--glass-blue);
  box-shadow:
    0 4px 12px rgba(25, 95, 215, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.role-moderator {
  background-color: var(--glass-green);
  box-shadow:
    0 4px 12px rgba(16, 165, 100, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.role-vip {
  background-color: var(--glass-orange);
  box-shadow:
    0 4px 12px rgba(255, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.role-user {
  background-color: var(--glass-bg-light);
  color: var(--color-light-grey);
}
.cinephile-star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  line-height: 1;
  filter: drop-shadow(0 0 6px rgba(255, 200, 40, 0.75));
  cursor: help;
  flex-shrink: 0;
}
.days-badge {
  font-size: 11px;
  color: var(--color-light-grey);
  opacity: 0.85;
}
</style>
