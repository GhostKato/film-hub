<template>
  <div class="youtube-player">
    <YouTube v-if="videoId" :src="videoId" />
    <p v-else class="error">Video not found</p>
  </div>
</template>

<script setup lang="ts">
import YouTube from 'vue3-youtube'

const { videoId } = defineProps<{
  videoId: string
}>()
</script>

<style scoped>
.youtube-player {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 22px 48px rgba(0, 0, 0, 0.85),
    0 8px 18px rgba(0, 0, 0, 0.6);
}
.error {
  text-align: center;
  color: var(--color-red);
}
</style>
