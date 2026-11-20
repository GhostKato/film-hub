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

const chatStore = useChatStore()

const toggleWidget = () => {
  chatStore.isOpen = !chatStore.isOpen
}
</script>

<style scoped>
.chat-launcher {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 75;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.22), transparent 60%), var(--glass-red);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid var(--glass-border-bright);
  box-shadow:
    0 14px 28px rgba(159, 27, 25, 0.58),
    0 6px 14px rgba(0, 0, 0, 0.78),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.chat-launcher:hover {
  transform: translateY(-3px) scale(1.06);
  background-color: var(--glass-hover);
  border-color: var(--color-white);
  box-shadow:
    0 20px 38px rgba(255, 61, 0, 0.55),
    0 8px 18px rgba(0, 0, 0, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
}
.chat-launcher:active {
  transform: translateY(1px) scale(0.95);
  transition-duration: 0.08s;
}
.chat-launcher.active {
  background-color: var(--glass-hover);
  border-color: var(--color-white);
  box-shadow:
    0 16px 34px rgba(255, 61, 0, 0.6),
    0 6px 16px rgba(0, 0, 0, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.42);
}
.chat-launcher.has-unread {
  animation: pulseGlow 2.2s infinite;
}
.unread-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.85),
    0 0 10px rgba(255, 61, 0, 0.65);
}
@keyframes pulseGlow {
  0%,
  100% {
    box-shadow:
      0 14px 28px rgba(159, 27, 25, 0.58),
      0 0 0 0 rgba(255, 61, 0, 0.7),
      inset 0 1px 0 rgba(255, 255, 255, 0.34);
  }
  50% {
    box-shadow:
      0 14px 28px rgba(159, 27, 25, 0.58),
      0 0 0 11px rgba(255, 61, 0, 0),
      inset 0 1px 0 rgba(255, 255, 255, 0.34);
  }
}
</style>
