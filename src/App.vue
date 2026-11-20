<template>
  <IHeader />
  <main class="app-main">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.name" />
      </Transition>
    </router-view>
  </main>
  <ModalMenu />
  <ModalAuth />
  <ChatWidget />
  <ILoader />
  <HotKeys />
  <INotification />
</template>

<script setup lang="ts">
import IHeader from '@/components/IHeader/IHeader.vue'
import ILoader from '@/components/ILoader/ILoader.vue'
import ModalMenu from '@/components/ModalMenu/ModalMenu.vue'
import ModalAuth from './components/ModalAuth/ModalAuth.vue'
import ChatWidget from './components/ChatWidget/ChatWidget.vue'
import { useAuthStore } from './stores/auth'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useLoaderStore } from './stores/loader'
import HotKeys from './components/HotKeys/HotKeys.vue'
import { MAIN_ACCOUNT_ID } from '@/constants/env'
import { useMediaStore } from './stores/media'
import { useFriendsStore } from './stores/friends'
import { useChatStore } from './stores/chat'
import { updateOnlineStatus } from './api/users'
import INotification from './components/INotification/INotification.vue'
import { notificationStore } from './stores/notifications'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const loaderStore = useLoaderStore()
const mediaStore = useMediaStore()
const friendsStore = useFriendsStore()
const chatStore = useChatStore()
const { t } = useI18n()

authStore.initAuthListener()

const loadRecommendedSafe = async () => {
  if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
    try {
      await mediaStore.fetchRecommended()
    } catch {
      notificationStore.error(t('notification_message.recommended_collection_error'))
    }
  }
}

const showCollectionInfo = () => {
  if (authStore.user) {
    notificationStore.info(t('notification_message.user_collection_info'))
  } else {
    notificationStore.info(t('notification_message.guest_collection_info'))
  }
}

const handleBeforeUnload = () => {
  if (authStore.user?.uid) {
    updateOnlineStatus(authStore.user.uid, false)
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  loaderStore.showGlobalLoader()
  try {
    await mediaStore.load()
    if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
      await loadRecommendedSafe()
    }
    if (authStore.user) {
      friendsStore.init()
      await chatStore.init()
    }
  } catch {
    notificationStore.error(t('notification_message.user_collection_error'))
  } finally {
    setTimeout(() => {
      loaderStore.hideGlobalLoader()
    }, 500)
    showCollectionInfo()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  friendsStore.cleanup()
  chatStore.cleanup()
})

watch(
  () => authStore.user,
  async (newUser, oldUser) => {
    loaderStore.showLoader()
    try {
      if (!newUser && oldUser?.uid) {
        await updateOnlineStatus(oldUser.uid, false)
        friendsStore.cleanup()
        chatStore.cleanup()
      }

      await mediaStore.load()
      if (!newUser || newUser.uid !== MAIN_ACCOUNT_ID) {
        await loadRecommendedSafe()
      }

      if (newUser) {
        friendsStore.init()
        await chatStore.init()
      }
    } catch {
      notificationStore.error(t('notification_message.user_collection_error'))
    } finally {
      loaderStore.hideLoader()
    }
  },
)
</script>

<style>
.app-main {
  min-height: calc(100vh - 100px);
  background-color: #080404;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
