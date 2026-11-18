<template>
  <ChatLauncher />

  <Transition name="widget-pop">
    <div v-if="chatStore.isOpen" class="chat-window" :class="{ expanded: chatStore.isExpanded }">
      <div class="window-header">
        <div class="header-left">
          <h3 class="window-title">{{ $t('chat.center_title') }}</h3>
          <button
            v-if="chatStore.currentUserProfile"
            class="stealth-btn"
            :class="{ active: chatStore.currentUserProfile.hideOnline }"
            @click="chatStore.toggleStealthMode()"
            :title="$t('chat.stealth_hint')"
          >
            {{
              chatStore.currentUserProfile.hideOnline
                ? `👻 ${$t('chat.stealth_on')}`
                : `🟢 ${$t('chat.online')}`
            }}
          </button>
        </div>

        <div class="header-actions">
          <button
            class="icon-btn"
            @click="chatStore.isExpanded = !chatStore.isExpanded"
            :title="chatStore.isExpanded ? $t('chat.collapse') : $t('chat.expand')"
          >
            {{ chatStore.isExpanded ? '⤡' : '⤢' }}
          </button>
          <button class="icon-btn" @click="chatStore.isOpen = false">
            <XIcon width="20" height="20" />
          </button>
        </div>
      </div>

      <div class="tabs-bar">
        <button
          v-if="authStore.user"
          class="tab-item"
          :class="{ active: chatStore.activeTab === 'friends' }"
          @click="chatStore.activeTab = 'friends'"
        >
          {{ $t('chat.tab_friends') }}
          <span v-if="friendsStore.incomingRequests.length" class="mini-badge">
            {{ friendsStore.incomingRequests.length }}
          </span>
        </button>

        <button
          class="tab-item"
          :class="{ active: chatStore.activeTab === 'system' }"
          @click="chatStore.activeTab = 'system'"
        >
          {{ $t('chat.tab_system') }}
          <span v-if="chatStore.systemTabUnreadCount" class="mini-badge">
            {{ chatStore.systemTabUnreadCount }}
          </span>
        </button>

        <button
          v-if="authStore.user && chatStore.activePeerUid"
          class="tab-item"
          :class="{ active: chatStore.activeTab === 'dialog' }"
          @click="chatStore.activeTab = 'dialog'"
        >
          {{ activePeerName }}
        </button>

        <button
          v-if="canSeeAllUsers"
          class="tab-item admin-tab"
          :class="{ active: chatStore.activeTab === 'all' }"
          @click="chatStore.activeTab = 'all'"
        >
          {{ $t('chat.tab_all') }}
        </button>
      </div>

      <div class="window-body" :class="{ 'split-layout': chatStore.isExpanded && authStore.user }">
        <div v-if="chatStore.isExpanded && authStore.user" class="sidebar-pane">
          <FriendsTab v-if="chatStore.activeTab !== 'all'" />
          <AdminUsersTab v-else />
        </div>

        <div class="main-pane">
          <template v-if="!authStore.user">
            <SystemTab />
          </template>
          <template v-else>
            <DialogTab v-if="chatStore.activeTab === 'dialog' && chatStore.activePeerUid" />
            <SystemTab v-else-if="chatStore.activeTab === 'system'" />
            <AdminUsersTab v-else-if="chatStore.activeTab === 'all' && !chatStore.isExpanded" />
            <FriendsTab v-else-if="!chatStore.isExpanded" />
            <div v-else class="empty-dialog-placeholder">
              <p>{{ $t('chat.select_friend_hint') }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import ChatLauncher from './ChatLauncher.vue'
import FriendsTab from './FriendsTab.vue'
import SystemTab from './SystemTab.vue'
import DialogTab from './DialogTab.vue'
import AdminUsersTab from './AdminUsersTab.vue'
import XIcon from '@/components/icons/XIcon.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()

const canSeeAllUsers = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canSeeAllUsers),
)

const activePeerName = computed(() => {
  if (!chatStore.activePeerUid) return ''
  return friendsStore.profilesMap[chatStore.activePeerUid]?.displayName || 'Чат'
})
</script>

<style scoped>
.chat-window {
  position: fixed;
  right: 18px;
  bottom: 84px;
  z-index: 85;
  width: calc(100vw - 36px);
  max-width: 380px;
  height: 500px;
  display: flex;
  flex-direction: column;
  background-color: var(--glass-modal);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid var(--glass-border-bright);
  border-radius: 16px;
  box-shadow:
    0 28px 60px rgba(0, 0, 0, 0.92),
    0 12px 24px rgba(0, 0, 0, 0.72),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.chat-window.expanded {
  left: 50%;
  bottom: 50%;
  transform: translate(-50%, 50%);
  width: 94vw;
  max-width: 920px;
  height: 78vh;
  max-height: 680px;
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.35);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.window-title {
  font-size: 16px;
  margin: 0;
}
.stealth-btn {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 8px;
  color: var(--color-white);
  background-color: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.stealth-btn.active {
  background-color: var(--glass-purple);
  border-color: var(--glass-border-bright);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.icon-btn:hover {
  background-color: var(--glass-hover);
}

.tabs-bar {
  display: flex;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--glass-border);
  overflow-x: auto;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-white);
  background-color: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}
.tab-item:hover {
  background-color: var(--glass-hover);
}
.tab-item.active {
  background-color: var(--glass-red);
  border-color: var(--glass-border-bright);
}
.admin-tab {
  border-color: rgba(255, 185, 45, 0.5);
}
.mini-badge {
  background-color: var(--color-hover);
  padding: 1px 5px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.window-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.window-body.split-layout .sidebar-pane {
  width: 340px;
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.empty-dialog-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-light-grey);
  padding: 20px;
  text-align: center;
}

.widget-pop-enter-active,
.widget-pop-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.widget-pop-enter-from,
.widget-pop-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
</style>
