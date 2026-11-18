<template>
  <IButton variant="recommend-btn" @click="openRecommend">
    {{ $t('media_page.recommend_btn') }}
  </IButton>
  <RecommendModal v-if="isModalOpen" :media="media" @close="isModalOpen = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import { notificationStore } from '@/stores/notifications'
import type { SharedMediaCard } from '@/types/chat'
import IButton from '@/components/IButton/IButton.vue'
import RecommendModal from '@/components/RecommendModal/RecommendModal.vue'

defineProps<{
  media: SharedMediaCard
}>()

const { t } = useI18n()
const authStore = useAuthStore()
const modalStore = useModalStore()
const isModalOpen = ref(false)

const openRecommend = () => {
  if (!authStore.user) {
    notificationStore.info(t('chat.login_to_recommend'))
    modalStore.open('auth')
    return
  }
  isModalOpen.value = true
}
</script>
