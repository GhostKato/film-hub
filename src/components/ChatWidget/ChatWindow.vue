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
import { computed, watch } from 'vue'
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

const canSeeAllUsers = computed(() =>
  Boolean(chatStore.currentUserProfile?.permissions.canSeeAllUsers),
)

watch(
  () => authStore.user?.uid,
  (uid) => {
    if (uid) {
      chatStore.init()
      friendsStore.init()
    } else {
      chatStore.cleanup()
      friendsStore.cleanup()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.chat-window {
  position: fixed;
  bottom: 84px;
  right: 18px;
  z-index: 90;
  width: 380px;
  height: 520px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 104px);
  background-color: var(--glass-modal);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid var(--glass-border-bright);
  border-radius: 18px;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    width 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.chat-window.expanded {
  width: 780px;
  height: 620px;
}
@media (max-width: 767px) {
  .chat-window,
  .chat-window.expanded {
    right: 12px;
    left: 12px;
    width: auto;
    bottom: 78px;
    height: calc(100vh - 96px);
  }
  .mobile-hidden {
    display: none !important;
  }
}
.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.25);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.window-title {
  font-size: 16px;
  font-weight: 700;
}
.stealth-btn {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-light-grey);
  cursor: pointer;
}
.stealth-btn.active {
  background-color: var(--glass-purple);
  color: var(--color-white);
  border-color: var(--glass-border-bright);
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
  background-color: var(--glass-bg);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 15px;
}
.icon-btn:hover {
  background-color: var(--glass-hover);
}
.tabs-bar {
  display: flex;
  border-bottom: 1px solid var(--glass-border);
}
.tab-item {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-light-grey);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.tab-item.active {
  color: var(--color-white);
  border-bottom-color: var(--color-hover);
  background-color: var(--glass-bg);
}
.mini-badge {
  background-color: var(--color-hover);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
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
  padding: 6px;
  gap: 6px;
  border-bottom: 1px solid var(--glass-border);
}
.sub-tab-btn {
  flex: 1;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-light-grey);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.sub-tab-btn.active {
  background-color: var(--glass-red);
  color: var(--color-white);
}
.sub-tab-btn.admin-sub.active {
  background-color: var(--glass-purple);
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
  padding: 20px;
  text-align: center;
  color: var(--color-light-grey);
}
.widget-pop-enter-active,
.widget-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.widget-pop-enter-from,
.widget-pop-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.96);
}
</style>
