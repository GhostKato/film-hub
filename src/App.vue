<template>
  <IHeader />
  <main>
    <router-view />
  </main>
  <ModalMenu />
  <ModalAuth />
  <ILoader />
  <HotKeys />
  <INotification />
</template>

<script setup lang="ts">
import IHeader from '@/components/IHeader/IHeader.vue'
import ILoader from '@/components/ILoader/ILoader.vue'
import ModalMenu from '@/components/ModalMenu/ModalMenu.vue'
import ModalAuth from './components/ModalAuth/ModalAuth.vue'
import { useAuthStore } from './stores/auth'
import { onMounted, watch } from 'vue'
import { useLoaderStore } from './stores/loader'
import HotKeys from './components/HotKeys/HotKeys.vue'
import { MAIN_ACCOUNT_ID } from '@/constants/env'
import { useMediaStore } from './stores/media'
import INotification from './components/INotification/INotification.vue'
import { notificationStore } from './stores/notifications'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const loaderStore = useLoaderStore()
const { t } = useI18n()

authStore.initAuthListener()
const mediaStore = useMediaStore()

onMounted(async () => {
  loaderStore.showGlobalLoader()
  try {
    await mediaStore.load()
    if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
      await mediaStore.fetchRecommended()
    }
    notificationStore.success(t('notification_message.collection_success'))
  } catch {
    notificationStore.error(t('notification_message.collection_error'))
  } finally {
    setTimeout(() => {
      loaderStore.hideGlobalLoader()
    }, 500)
  }
})

watch(
  () => authStore.user,
  async () => {
    loaderStore.showLoader()
    try {
      await mediaStore.load()
      if (!authStore.user || authStore.user.uid !== MAIN_ACCOUNT_ID) {
        await mediaStore.fetchRecommended()
      }
    } catch {
      notificationStore.error(t('notification_message.collection_error'))
    } finally {
      loaderStore.hideLoader()
    }
  },
)
</script>
