<template>
  <template v-if="authStore.user">
    <ChatBatton v-if="!chatStore.isOpen" />

    <Transition name="widget-pop">
      <div
        v-if="chatStore.isOpen"
        ref="chatWindowRef"
        class="chat-window"
        :class="{ expanded: chatStore.isExpanded, dragging: isDragging }"
        :style="windowDragStyle"
      >
        <div class="window-header" @pointerdown="startDrag">
          <div class="header-left">
            <h3 class="window-title">{{ $t('chat.center_title') }}</h3>
            <button
              v-if="chatStore.currentUserProfile"
              class="stealth-btn"
              :class="{
                active: chatStore.currentUserProfile.hideOnline && chatStore.canUseStealth,
              }"
              :disabled="!chatStore.canUseStealth"
              @click="chatStore.toggleStealthMode()"
              :title="chatStore.canUseStealth ? $t('chat.stealth_hint') : undefined"
            >
              {{
                chatStore.currentUserProfile.hideOnline && chatStore.canUseStealth
                  ? `👻 ${$t('chat.stealth_on')}`
                  : `🟢 ${$t('chat.online')}`
              }}
            </button>
          </div>

          <div class="header-actions">
            <button
              class="icon-btn expand-btn"
              @click="chatStore.isExpanded = !chatStore.isExpanded"
              :title="chatStore.isExpanded ? $t('chat.collapse') : $t('chat.expand')"
            >
              {{ chatStore.isExpanded ? '⤡' : '⤢' }}
            </button>
            <button class="icon-btn" @click="closeChatWidget">
              <XIcon width="20" height="20" />
            </button>
          </div>
        </div>

        <div class="tabs-bar">
          <div class="tabs-left-group">
            <button
              v-if="chatStore.canSeeAllUsers"
              class="tab-item"
              :class="{ active: isAllTabActive }"
              @click="selectAllUsersTab"
            >
              {{ $t('chat.tab_all') }}
            </button>

            <button
              class="tab-item"
              :class="{ active: isFriendsTabActive }"
              @click="selectFriendsTab"
            >
              {{ $t('chat.tab_friends') }}
              <span v-if="friendsStore.incomingRequests.length" class="mini-badge">
                {{ friendsStore.incomingRequests.length }}
              </span>
            </button>
          </div>

          <div class="tabs-right-group">
            <button class="tab-item" :class="{ active: isChatsTabActive }" @click="selectChatsTab">
              {{ $t('chat.tab_chat') }}
              <span v-if="totalChatsTabBadge > 0" class="mini-badge">
                {{ totalChatsTabBadge }}
              </span>
            </button>
          </div>
        </div>

        <div class="window-body">
          <div class="chat-split-layout">
            <div class="sidebar-pane">
              <div class="sidebar-content">
                <AllUsersTab v-if="chatStore.canSeeAllUsers && chatStore.chatSubTab === 'all'" />
                <FriendsTab v-else />
              </div>
            </div>

            <div class="chat-pane">
              <ChatTab v-if="chatStore.activeChatId" />
              <SystemNotifications v-else-if="isSystemOpen" @close="isSystemOpen = false" />
              <AllUsersTab
                v-else-if="
                  !chatStore.isExpanded && compactSection === 'all' && chatStore.canSeeAllUsers
                "
              />
              <FriendsTab v-else-if="!chatStore.isExpanded && compactSection === 'friends'" />
              <AllChatTab v-else @open-system="isSystemOpen = true" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useFriendsStore } from '@/stores/friends'
import ChatBatton from './ChatBatton.vue'
import SystemNotifications from './SystemNotifications.vue'
import FriendsTab from './FriendsTab.vue'
import AllUsersTab from './AllUsersTab.vue'
import ChatTab from './ChatTab.vue'
import AllChatTab from './AllChatTab.vue'
import XIcon from '@/components/icons/XIcon.vue'

const authStore = useAuthStore()
const chatStore = useChatStore()
const friendsStore = useFriendsStore()

const compactSection = ref<'all' | 'friends' | 'chats'>('chats')
const isSystemOpen = ref(false)

const chatWindowRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const customPosition = ref<{ left: number; top: number } | null>(null)

let dragOffsetX = 0
let dragOffsetY = 0

const windowDragStyle = computed(() => {
  if (!customPosition.value) return {}
  return {
    left: `${customPosition.value.left}px`,
    top: `${customPosition.value.top}px`,
    right: 'auto',
    bottom: 'auto',
  }
})

const clampPosition = (left: number, top: number) => {
  const el = chatWindowRef.value
  const width = el?.offsetWidth || (chatStore.isExpanded ? 800 : 390)
  const height = el?.offsetHeight || (chatStore.isExpanded ? 630 : 540)
  const margin = 12

  const maxLeft = Math.max(margin, window.innerWidth - width - margin)
  const maxTop = Math.max(margin, window.innerHeight - height - margin)

  return {
    left: Math.min(Math.max(margin, left), maxLeft),
    top: Math.min(Math.max(margin, top), maxTop),
  }
}

const closeChatWidget = () => {
  stopDrag()
  customPosition.value = null
  chatStore.isOpen = false
}

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return
  customPosition.value = clampPosition(event.clientX - dragOffsetX, event.clientY - dragOffsetY)
}

const stopDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopDrag)
}

const startDrag = (event: PointerEvent) => {
  if (window.innerWidth < 768 || event.button !== 0) return
  const target = event.target as HTMLElement | null
  if (target?.closest('button, input, select, a')) return

  const el = chatWindowRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  dragOffsetX = event.clientX - rect.left
  dragOffsetY = event.clientY - rect.top

  customPosition.value = { left: rect.left, top: rect.top }
  isDragging.value = true

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopDrag)
}

const handleWindowResize = () => {
  if (window.innerWidth < 768) {
    customPosition.value = null
    return
  }
  if (customPosition.value) {
    customPosition.value = clampPosition(customPosition.value.left, customPosition.value.top)
  }
}

const totalChatsTabBadge = computed(() => {
  return chatStore.chatUnreadCount + chatStore.systemTabUnreadCount
})

const isAllTabActive = computed(() => {
  if (!chatStore.canSeeAllUsers) return false
  if (chatStore.isExpanded) return chatStore.chatSubTab === 'all'
  return !chatStore.activeChatId && !isSystemOpen.value && compactSection.value === 'all'
})

const isFriendsTabActive = computed(() => {
  if (chatStore.isExpanded) {
    return !chatStore.canSeeAllUsers || chatStore.chatSubTab === 'friends'
  }
  return !chatStore.activeChatId && !isSystemOpen.value && compactSection.value === 'friends'
})

const isChatsTabActive = computed(() => {
  if (chatStore.isExpanded) return true
  return Boolean(chatStore.activeChatId) || isSystemOpen.value || compactSection.value === 'chats'
})

const selectAllUsersTab = () => {
  chatStore.chatSubTab = 'all'
  if (!chatStore.isExpanded) {
    if (chatStore.activeChatId) chatStore.closeChat()
    isSystemOpen.value = false
    compactSection.value = 'all'
  }
}

const selectFriendsTab = () => {
  chatStore.chatSubTab = 'friends'
  if (!chatStore.isExpanded) {
    if (chatStore.activeChatId) chatStore.closeChat()
    isSystemOpen.value = false
    compactSection.value = 'friends'
  }
}

const selectChatsTab = () => {
  if (chatStore.activeChatId) chatStore.closeChat()
  isSystemOpen.value = false
  compactSection.value = 'chats'
}

watch(
  () => chatStore.activeChatId,
  (chatId) => {
    if (chatId) {
      isSystemOpen.value = false
      compactSection.value = 'chats'
    }
  },
)

watch(
  () => chatStore.isExpanded,
  async (expanded) => {
    if (expanded) {
      compactSection.value = 'chats'
    }
    if (customPosition.value) {
      await new Promise((r) => setTimeout(r, 310))
      if (customPosition.value) {
        customPosition.value = clampPosition(customPosition.value.left, customPosition.value.top)
      }
    }
  },
)

onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  stopDrag()
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<style scoped>
.chat-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 90;
  width: 390px;
  height: 540px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 40px);
  background:
    radial-gradient(circle at 12% 0%, rgba(159, 27, 25, 0.24) 0%, transparent 48%),
    radial-gradient(circle at 92% 100%, rgba(25, 85, 235, 0.18) 0%, transparent 52%),
    var(--glass-modal);
  backdrop-filter: blur(24px) saturate(165%);
  -webkit-backdrop-filter: blur(24px) saturate(165%);
  border: 1px solid var(--glass-border-bright);
  border-radius: 18px;
  box-shadow:
    0 28px 65px rgba(0, 0, 0, 0.92),
    0 12px 26px rgba(0, 0, 0, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    width 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.chat-window.expanded {
  width: 800px;
  height: 630px;
}
.window-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.48) 0%, rgba(0, 0, 0, 0.2) 100%);
}
.window-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 4%;
  width: 92%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--glass-border-bright) 50%,
    transparent 100%
  );
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.window-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
}
.stealth-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-light-grey);
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition:
    transform 0.2s ease,
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease;
}
.stealth-btn:disabled {
  pointer-events: none;
  cursor: default;
  opacity: 1;
}
.stealth-btn:not(:disabled):hover {
  border-color: var(--color-purple);
  background-color: rgba(135, 55, 215, 0.28);
  color: var(--color-white);
}
.stealth-btn:not(:disabled):active {
  transform: translateY(1px) scale(0.96);
  box-shadow: none;
  transition-duration: 0.08s;
}
.stealth-btn.active {
  background-color: var(--glass-purple);
  color: var(--color-white);
  border-color: var(--color-purple);
  box-shadow:
    0 0 12px rgba(135, 55, 215, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 15px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.2s ease;
}
.icon-btn:hover {
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.icon-btn:active {
  transform: translateY(1px) scale(0.94);
  box-shadow: none;
  transition-duration: 0.08s;
}
.tabs-bar {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.22);
}
.tabs-left-group {
  display: flex;
  flex: 2;
  padding: 0 6px 0 10px;
  gap: 4px;
}
.tabs-left-group:has(> :only-child) {
  flex: 1;
}
.tabs-right-group {
  display: flex;
  flex: 1;
  padding: 0 10px 0 6px;
}
.chat-window.expanded .tabs-left-group {
  width: 300px;
  flex: none;
  padding: 0 10px;
  border-right: 1px solid var(--glass-border);
}
.chat-window.expanded .tabs-right-group {
  flex: 1;
  padding: 0 12px;
}
.tab-item {
  position: relative;
  flex: 1;
  padding: 10px 8px;
  border: none;
  border-radius: 8px 8px 0 0;
  background: transparent;
  color: var(--color-light-grey);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}
.tab-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12%;
  width: 76%;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background-color: var(--color-hover);
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.tab-item:hover:not(.active) {
  color: var(--color-white);
  background-color: rgba(255, 255, 255, 0.05);
}
.tab-item.active {
  color: var(--color-white);
  background: linear-gradient(180deg, rgba(159, 27, 25, 0.22) 0%, rgba(159, 27, 25, 0.05) 100%);
}
.tab-item.active::after {
  transform: scaleX(1);
}
.mini-badge {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
}
.window-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.chat-split-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.sidebar-pane {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--glass-border);
}
.chat-window:not(.expanded) .sidebar-pane {
  display: none;
}
.chat-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sidebar-content {
  flex: 1;
  overflow: hidden;
}
.widget-pop-enter-active,
.widget-pop-leave-active {
  transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.widget-pop-enter-from,
.widget-pop-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
@media (min-width: 768px) {
  .window-header {
    cursor: grab;
    user-select: none;
  }
  .chat-window.dragging .window-header {
    cursor: grabbing;
  }
  .chat-window.dragging {
    transition: none;
  }
}
@media (max-width: 767px) {
  .expand-btn,
  .sidebar-pane {
    display: none !important;
  }
  .chat-window,
  .chat-window.expanded {
    right: 12px !important;
    left: 12px !important;
    top: auto !important;
    bottom: 12px !important;
    width: auto;
    height: 70dvh;
    max-height: calc(100dvh - 88px);
  }
}
</style>
