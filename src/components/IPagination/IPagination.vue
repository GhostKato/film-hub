<template>
  <div class="pagination" v-if="totalPages > 1">
    <button type="button" @click="prev" :disabled="currentPage === 1">Попередня</button>
    <span>{{ currentPage }} / {{ totalPages }}</span>
    <button type="button" @click="next" :disabled="currentPage === totalPages">Наступна</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const prev = () => {
  if (props.currentPage > 1) emit('update:page', props.currentPage - 1)
}

const next = () => {
  if (props.currentPage < props.totalPages) emit('update:page', props.currentPage + 1)
}
</script>

<style scoped>
.pagination {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:not(:disabled):hover {
  background-color: #ff3d00;
}

.pagination button:disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
