<template>
  <div class="release-vote-container">
    <p
      v-if="item.release_date || item.first_air_date"
      class="release"
      :style="{
        backgroundColor: getReleaseColor((item.release_date ?? item.first_air_date) || ''),
      }"
    >
      {{ item.release_date || item.first_air_date }}
    </p>

    <p
      v-if="item.vote_average"
      class="rating"
      :style="{ backgroundColor: getRatingColor(Number(item.vote_average)) }"
    >
      {{ item.vote_average }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { getRatingColor, getReleaseColor } from '@/utils/getColors'
import type { MediaInfoType } from '@/types/media'

defineProps<{
  item: MediaInfoType
}>()
</script>

<style scoped>
.release-vote-container {
  position: absolute;
  top: 3px;
  left: 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.release {
  padding: 3px;
  border-radius: 8px;
  font-size: 15px;
}
.rating {
  padding: 3px;
  border-radius: 8px;
  font-size: 15px;
  margin-right: auto;
}
</style>
