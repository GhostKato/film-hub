<template>
  <div class="pagination" v-if="totalPages > 1">
    <IButton @click="prev" :disabled="currentPage === 1">
      {{ $t('pagination.previous') }}
    </IButton>
    <span>{{ currentPage }} / {{ totalPages }}</span>
    <IButton @click="next" :disabled="currentPage === totalPages">
      {{ $t('pagination.next') }}
    </IButton>
  </div>
</template>

<script setup lang="ts">
import IButton from '../IButton/IButton.vue'

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
  background: var(--color-dark-grey);
  color: var(--color-white);
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:not(:disabled):hover {
  background-color: var(--color-hover);
}

.pagination button:disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
