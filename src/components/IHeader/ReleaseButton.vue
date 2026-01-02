<template>
  <IButton @click="toggleMenu" variant="menu-btn">
    <ReleaseIcon class="bell-icon" :class="{ 'animate-bell': hasReleases }" />
  </IButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useMediaStore } from '@/stores/media'
import IButton from '@/components/IButton/IButton.vue'
import ReleaseIcon from '../icons/ReleaseIcon.vue'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'

const modalStore = useModalStore()
const mediaStore = useMediaStore()

const releaseList = computed(() => mediaStore.releaseList())
const hasReleases = computed(() => releaseList.value.length > 0)

const { t } = useI18n()

function toggleMenu() {
  if (hasReleases.value) {
    modalStore.toggle('release')
  } else {
    notificationStore.info(t('notification_message.release_empty_info'))
  }
}
</script>

<style scoped>
@keyframes bell-shake {
  0% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(15deg);
  }
  40% {
    transform: rotate(-10deg);
  }
  60% {
    transform: rotate(10deg);
  }
  80% {
    transform: rotate(-5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
.bell-icon {
  width: 30px;
  height: 30px;
  color: var(--color-white);
  transition: color 0.3s ease;
}
.animate-bell {
  animation: bell-shake 0.8s ease-in-out infinite;
  color: var(--color-red);
}
.bell-icon:hover {
  color: var(--color-hover);
}
</style>
