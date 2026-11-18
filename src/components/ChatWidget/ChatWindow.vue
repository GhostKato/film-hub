<template>
  <template v-if="authStore.user">
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
            <div
              class="sidebar-pane"
              :class="{ 'mobile-hidden': Boolean(chatStore.activePeerUid) }"
            >
              <div class="sub-tabs-bar">
                <button
                  v-if="canSeeAllUsers"
                  class="sub-tab-btn admin-sub"
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
                <AdminUsersTab v-if="canSeeAllUsers && chatStore.chatSubTab === 'all'" />
                <FriendsTab v-else />
              </div>
            </div>

            <div class="dialog-pane" :class="{ 'mobile-hidden': !chatStore.activePeerUid }">
              <DialogTab v-if="chatStore.activePeerUid" />
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
</script>

<style scoped>
.chat-window {
  position: fixed;
  right: 18px;
  bottom: 84px;
  z-index: 85;
  width: calc(100vw - 36px);
  max-width: 680px;
  height: 520px;
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
  max-width: 960px;
  height: 78vh;
  max-height: 700px;
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
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.2);
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-white);
  background-color: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.tab-item:hover {
  background-color: var(--glass-hover);
}
.tab-item.active {
  background-color: var(--glass-red);
  border-color: var(--glass-border-bright);
}

.mini-badge {
  background-color: var(--color-hover);
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.window-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.full-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-split-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar-pane {
  width: 270px;
  flex-shrink: 0;
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.15);
}

.sub-tabs-bar {
  display: flex;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--glass-border);
}

.sub-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-white);
  background-color: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.sub-tab-btn:hover {
  background-color: var(--glass-hover);
}
.sub-tab-btn.active {
  background-color: var(--glass-blue);
  border-color: var(--glass-border-bright);
}
.admin-sub {
  border-color: rgba(255, 185, 45, 0.45);
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.empty-dialog-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-light-grey);
  padding: 20px;
  text-align: center;
  font-size: 14px;
}

@media (max-width: 640px) {
  .sidebar-pane {
    width: 100%;
    border-right: none;
  }
  .mobile-hidden {
    display: none;
  }
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
