<template>
  <IButton @click="toggleMenu" variant="menu-btn" class="release-bell-btn">
    <ReleaseIcon class="bell-icon" :class="{ 'animate-bell': hasReleases }" />
  </IButton>
</template>

<script lang="ts">
let ringInterval: ReturnType<typeof setInterval> | null = null
let activeInstances = 0
</script>

<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useMediaStore } from '@/stores/media'
import IButton from '@/components/IButton/IButton.vue'
import ReleaseIcon from '../icons/ReleaseIcon.vue'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'
import { playBellSound } from '@/utils/playBellSound'

const modalStore = useModalStore()
const mediaStore = useMediaStore()

const releaseList = computed(() => mediaStore.releaseList())
const hasReleases = computed(() => releaseList.value.length > 0)
const isReleaseModalOpen = computed(() => modalStore.modals.release)

const { t } = useI18n()

const stopRingingLoop = () => {
  if (ringInterval) {
    clearInterval(ringInterval)
    ringInterval = null
  }
}

const startRingingLoop = () => {
  if (ringInterval) return
  playBellSound()
  ringInterval = setInterval(() => {
    if (hasReleases.value && !isReleaseModalOpen.value) {
      playBellSound()
    } else {
      stopRingingLoop()
    }
  }, 2400)
}

const unlockAndStart = (e: Event) => {
  const target = e.target as HTMLElement | null
  if (target?.closest('.menu-btn')) return

  if (hasReleases.value && !isReleaseModalOpen.value) {
    startRingingLoop()
  }
}

watch(
  [hasReleases, isReleaseModalOpen],
  ([releases, modalOpen]) => {
    if (releases && !modalOpen) {
      startRingingLoop()
    } else {
      stopRingingLoop()
    }
  },
  { immediate: true },
)

onMounted(() => {
  activeInstances++
  if (activeInstances === 1) {
    window.addEventListener('pointerdown', unlockAndStart)
    window.addEventListener('keydown', unlockAndStart)
  }
})

onBeforeUnmount(() => {
  activeInstances--
  if (activeInstances <= 0) {
    activeInstances = 0
    stopRingingLoop()
    window.removeEventListener('pointerdown', unlockAndStart)
    window.removeEventListener('keydown', unlockAndStart)
  }
})

function toggleMenu() {
  if (hasReleases.value) {
    modalStore.toggle('release')
  } else {
    notificationStore.info(t('notification_message.release_empty_info'))
  }
}
</script>

<style scoped>
@keyframes bell-ring {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
    filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 8px rgba(159, 27, 25, 0.5));
  }
  8% {
    transform: rotate(22deg) scale(1.1);
    filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 14px rgba(255, 61, 0, 0.9));
  }
  16% {
    transform: rotate(-20deg) scale(1.1);
    filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 16px rgba(255, 61, 0, 0.95));
  }
  24% {
    transform: rotate(15deg) scale(1.06);
  }
  32% {
    transform: rotate(-12deg) scale(1.04);
  }
  40% {
    transform: rotate(7deg) scale(1.02);
  }
  48% {
    transform: rotate(-4deg) scale(1);
  }
  56% {
    transform: rotate(0deg) scale(1);
    filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 8px rgba(159, 27, 25, 0.5));
  }
}

.release-bell-btn {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.release-bell-btn:hover {
  transform: translateY(-2px);
}

.release-bell-btn:active {
  transform: translateY(1px) scale(0.92);
  transition-duration: 0.08s;
}

.bell-icon {
  width: 30px;
  height: 30px;
  color: var(--color-white);
  transform-origin: 50% 15%;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.85))
    drop-shadow(0 2px 4px rgba(255, 255, 255, 0.16));
  transition:
    color 0.3s ease,
    transform 0.3s ease,
    filter 0.3s ease;
  will-change: transform, filter;
}

.animate-bell {
  animation: bell-ring 2.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
  color: var(--color-hover);
}

.bell-icon:hover {
  color: var(--color-hover);
  animation-play-state: paused;
  transform: scale(1.1);
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px rgba(255, 61, 0, 0.65));
}
</style>
