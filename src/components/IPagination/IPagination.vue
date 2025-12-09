<template>
  <div class="pagination" v-if="totalPages > 1">
    <IButton variant="pagination-btn" @click="prev" :disabled="currentPage === 1">
      {{ $t('pagination.previous') }}
    </IButton>
    <span>{{ currentPage }} / {{ totalPages }}</span>
    <IButton variant="pagination-btn" @click="next" :disabled="currentPage === totalPages">
      {{ $t('pagination.next') }}
    </IButton>
  </div>
</template>

<script setup lang="ts">
import IButton from '@/components/IButton/IButton.vue'
import { useModalStore } from '@/stores/modal'
import { onBeforeUnmount, onMounted } from 'vue'

const modalStore = useModalStore()

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
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') {
    modalStore.closeAll()
    next()
  }
  if (e.key === 'ArrowLeft') {
    modalStore.closeAll()
    prev()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.pagination {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

@media (min-width: 1920px) {
  .pagination {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -72px;
  }
}

@media (min-width: 2560px) {
  .pagination {
    bottom: -130px;
  }
}
</style>
