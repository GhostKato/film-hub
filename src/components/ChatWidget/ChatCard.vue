<template>
  <div class="chat-card" :class="{ unread: unread > 0 }" @click="$emit('select')">
    <div class="card-main">
      <div class="peer-block">
        <span v-if="isGroup" class="group-name">👥 {{ title }}</span>

        <UserBadge v-else-if="peerUser" :user="peerUser" :show-online="true" :show-days="false" />

        <span v-else class="group-name">{{ title }}</span>

        <p v-if="lastMessage" class="last-preview">
          {{ lastMessage }}
        </p>
      </div>

      <div class="meta-side">
        <span v-if="updatedAt" class="msg-date">
          {{ formattedDate }}
        </span>
        <span v-if="unread > 0" class="unread-badge">
          {{ unread }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UserProfile } from '@/types/chat'
import UserBadge from './UserBadge.vue'

const props = defineProps<{
  isGroup?: boolean
  title: string
  peerUser?: UserProfile | null
  lastMessage?: string
  updatedAt?: number
  unread: number
}>()

defineEmits<{
  (e: 'select'): void
}>()

const { locale } = useI18n()

const formattedDate = computed(() => {
  if (!props.updatedAt) return ''
  const d = new Date(props.updatedAt)
  const now = new Date()
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()

  if (isToday) {
    return d.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString(locale.value, { day: '2-digit', month: '2-digit' })
})
</script>

<style scoped>
.chat-card {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.52),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-card:hover {
  border-color: var(--color-hover);
  background-color: rgba(159, 27, 25, 0.18);
  transform: translateY(-1px);
}

.chat-card.unread {
  border-color: var(--color-hover);
  background: linear-gradient(90deg, rgba(159, 27, 25, 0.28) 0%, var(--glass-card) 100%);
}

.card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.peer-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-preview {
  margin: 0;
  font-size: 12px;
  color: var(--color-light-grey);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.msg-date {
  font-size: 11px;
  color: var(--color-light-grey);
}

.unread-badge {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
}
</style>
