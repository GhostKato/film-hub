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
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
}
.error {
  text-align: center;
  color: var(--color-red);
}
</style>
