<template>
  <button
    class="chat-launcher"
    :class="{ 'has-unread': chatStore.totalUnreadCount > 0, active: chatStore.isOpen }"
    @click="toggleWidget"
    :title="$t('chat.open_widget')"
  >
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
      <path
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"
      />
    </svg>
    <span v-if="chatStore.totalUnreadCount > 0" class="unread-badge">
      {{ chatStore.totalUnreadCount > 99 ? '99+' : chatStore.totalUnreadCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useMediaStore } from '@/stores/media'

const chatStore = useChatStore()
const authStore = useAuthStore()
const mediaStore = useMediaStore()

const toggleWidget = () => {
  if (!chatStore.isOpen && !authStore.user && mediaStore.releaseList().length > 0) {
    chatStore.activeTab = 'system'
  }
  chatStore.isOpen = !chatStore.isOpen
}
</script>

<style scoped>
.chat-launcher {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 75;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  background-color: var(--glass-modal);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid var(--glass-border-bright);
  box-shadow:
    0 16px 34px rgba(0, 0, 0, 0.85),
    0 6px 14px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.chat-launcher:hover {
  transform: translateY(-3px) scale(1.05);
  background-color: var(--glass-hover);
  border-color: var(--color-white);
}
.chat-launcher.active {
  background-color: var(--glass-red);
}
.chat-launcher.has-unread {
  animation: pulseGlow 2.4s infinite;
}
.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-white);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.8);
}

@keyframes pulseGlow {
  0%,
  100% {
    box-shadow:
      0 16px 34px rgba(0, 0, 0, 0.85),
      0 0 0 0 rgba(255, 61, 0, 0.6);
  }
  50% {
    box-shadow:
      0 16px 34px rgba(0, 0, 0, 0.85),
      0 0 0 10px rgba(255, 61, 0, 0);
  }
}
</style>
