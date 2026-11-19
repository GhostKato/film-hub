<template>
  <template v-if="authStore.user">
    <ChatLauncher />

    <Transition name="widget-pop">
      <div v-if="chatStore.isOpen" class="chat-window" :class="{ expanded: chatStore.isExpanded }">
        <div class="window-header">
          <div class="header-left">
            <h3 class="window-title">{{ $t('chat.center_title') }}</h3>
            <button
              v-if="chatStore.currentUserProfile && chatStore.canUseStealth"
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
            class="tab-item"
            :class="{ active: chatStore.activeTab === 'chat' }"
            @click="chatStore.activeTab = 'chat'"
          >
            {{ $t('chat.tab_chat') }}
            <span v-if="chatStore.chatUnreadCount" class="mini-badge">
              {{ chatStore.chatUnreadCount }}
            </span>
          </button>
        </div>

        <div class="window-body">
          <div v-if="chatStore.activeTab === 'system'" class="full-pane">
            <SystemTab />
          </div>

          <div v-else class="chat-split-layout">
            <div class="sidebar-pane" :class="{ 'mobile-hidden': Boolean(chatStore.activeChatId) }">
              <div class="sub-tabs-bar">
                <button
                  v-if="chatStore.canSeeAllUsers"
                  class="sub-tab-btn"
                  :class="{ active: chatStore.chatSubTab === 'all' }"
                  @click="chatStore.chatSubTab = 'all'"
                >
                  {{ $t('chat.tab_all') }}
                </button>

                <button
                  class="sub-tab-btn"
                  :class="{ active: chatStore.chatSubTab === 'friends' }"
                  @click="chatStore.chatSubTab = 'friends'"
                >
                  {{ $t('chat.tab_friends') }}
                  <span v-if="friendsStore.incomingRequests.length" class="mini-badge">
                    {{ friendsStore.incomingRequests.length }}
                  </span>
                </button>
              </div>
              <div class="sidebar-content">
                <AdminUsersTab v-if="chatStore.canSeeAllUsers && chatStore.chatSubTab === 'all'" />
                <FriendsTab v-else />
              </div>
            </div>

            <div class="dialog-pane" :class="{ 'mobile-hidden': !chatStore.activeChatId }">
              <DialogTab v-if="chatStore.activeChatId" />
              <div v-else class="empty-dialog-placeholder">
                <p>{{ $t('chat.select_friend_hint') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </template>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useFriendsStore } from '@/stores/friends'
import ChatLauncher from './ChatLauncher.vue'
import SystemTab from './SystemTab.vue'
import FriendsTab from './FriendsTab.vue'
import AdminUsersTab from './AdminUsersTab.vue'
import DialogTab from './DialogTab.vue'
import XIcon from '@/components/icons/XIcon.vue'

const authStore = useAuthStore()
const chatStore = useChatStore()
const friendsStore = useFriendsStore()
</script>

<style scoped>
.chat-window {
  position: fixed;
  bottom: 88px;
  right: 20px;
  z-index: 90;
  width: 390px;
  height: 540px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 110px);
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
@media (max-width: 767px) {
  .chat-window,
  .chat-window.expanded {
    right: 12px;
    left: 12px;
    width: auto;
    bottom: 82px;
    height: calc(100vh - 98px);
  }
  .mobile-hidden {
    display: none !important;
  }
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
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    transform 0.2s ease,
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}
.stealth-btn:hover {
  transform: translateY(-1px);
  border-color: var(--glass-border-bright);
  color: var(--color-white);
}
.stealth-btn.active {
  background-color: var(--glass-purple);
  color: var(--color-white);
  border-color: var(--glass-border-bright);
  box-shadow:
    0 8px 18px rgba(135, 55, 215, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
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
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.icon-btn:hover {
  transform: translateY(-2px);
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}
.icon-btn:active {
  transform: translateY(1px) scale(0.94);
}
.tabs-bar {
  display: flex;
  padding: 8px 10px 4px;
  gap: 8px;
}
.tab-item {
  flex: 1;
  padding: 7px 10px;
  border-radius: 8px;
  background-color: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  color: var(--color-light-grey);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition:
    transform 0.2s ease,
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}
.tab-item:hover:not(.active) {
  transform: translateY(-1px);
  background-color: rgba(255, 255, 255, 0.13);
  color: var(--color-white);
}
.tab-item.active {
  color: var(--color-white);
  background-color: var(--glass-red);
  border-color: var(--glass-border-bright);
  box-shadow:
    0 10px 22px rgba(159, 27, 25, 0.52),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
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
.full-pane {
  flex: 1;
  overflow: hidden;
}
.chat-split-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.sidebar-pane {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--glass-border);
}
.chat-window.expanded .sidebar-pane {
  width: 300px;
  flex-shrink: 0;
}
.dialog-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-window:not(.expanded) .sidebar-pane:not(.mobile-hidden) + .dialog-pane {
  display: none;
}
@media (min-width: 768px) {
  .chat-window:not(.expanded) .sidebar-pane.mobile-hidden {
    display: none;
  }
  .chat-window:not(.expanded) .dialog-pane:not(.mobile-hidden) {
    display: flex;
  }
}
.sub-tabs-bar {
  display: flex;
  padding: 6px 10px 8px;
  gap: 8px;
  border-bottom: 1px solid var(--glass-border);
}
.sub-tab-btn {
  flex: 1;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-light-grey);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}
.sub-tab-btn:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.12);
  color: var(--color-white);
}
.sub-tab-btn.active {
  background-color: rgba(175, 25, 25, 0.55);
  border-color: var(--glass-border-bright);
  color: var(--color-white);
  box-shadow:
    0 6px 14px rgba(159, 27, 25, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
.sidebar-content {
  flex: 1;
  overflow: hidden;
}
.empty-dialog-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--color-light-grey);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
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
</style>
