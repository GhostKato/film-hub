<template>
  <div class="noti-wrapper">
    <transition-group name="pop" tag="div">
      <div v-for="item in store.list" :key="item.id" class="noti" :class="item.type">
        <div class="icon">{{ item.icon }}</div>
        <div class="text">{{ item.message }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { notificationStore as store } from '@/stores/notifications'
</script>

<style scoped>
.noti-wrapper {
  position: fixed;
  top: 1.2rem;
  right: 1.2rem;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.noti {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 14px 18px;
  border-radius: 14px;

  font-size: 15px;
  color: white;

  min-width: 260px;
  max-width: 350px;

  background: rgba(25, 25, 25, 0.88);
  backdrop-filter: blur(14px) saturate(160%);

  box-shadow: 0 6px 26px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);

  transform-origin: right center;
}

.success {
  border-left: 5px solid #3cff78;
  box-shadow: 0 0 12px rgba(60, 255, 120, 0.4);
}

.error {
  border-left: 5px solid #ff3c3c;
  box-shadow: 0 0 12px rgba(255, 60, 60, 0.4);
}

.info {
  border-left: 5px solid #4da3ff;
  box-shadow: 0 0 12px rgba(77, 163, 255, 0.4);
}

.icon {
  font-size: 22px;
  opacity: 0.9;
}

.pop-enter-from {
  opacity: 0;
  transform: translateX(50%) scale(0.8);
}
.pop-enter-active {
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.pop-leave-active {
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(40%) scale(0.95);
}
</style>
