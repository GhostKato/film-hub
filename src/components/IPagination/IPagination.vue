<template>
  <div class="pagination" v-if="totalPages > 1">
    <IButton variant="pagination-btn" @click="prev" :disabled="currentPage === 1">
      {{ $t('pagination.previous') }}
    </IButton>

    <div class="pages-list">
      <button
        v-for="(page, index) in visiblePages"
        :key="index"
        :class="['page-item', { active: page === currentPage, dots: page === '...' }]"
        :disabled="page === '...'"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </div>

    <IButton variant="pagination-btn" @click="next" :disabled="currentPage === totalPages">
      {{ $t('pagination.next') }}
    </IButton>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import IButton from '@/components/IButton/IButton.vue'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const range = 3

  pages.push(1)

  let start = props.currentPage - range
  let end = props.currentPage + range

  if (start <= 1) {
    const extraRight = 2 - start
    end += extraRight
    start = 2
  }

  end = Math.min(props.totalPages, end)

  if (start > 2) {
    pages.push('...')
  }

  for (let i = start; i <= end; i++) {
    if (i !== 1) {
      pages.push(i)
    }
  }

  return pages
})

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    emit('update:page', page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prev = () => {
  if (props.currentPage > 1) goToPage(props.currentPage - 1)
}

const next = () => {
  if (props.currentPage < props.totalPages) goToPage(props.currentPage + 1)
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

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<style scoped>
.pagination {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
}
.pages-list {
  display: flex;
  gap: 6px;
}
.page-item {
  min-width: 40px;
  height: 35px;
  background-color: rgba(34, 38, 42, 0.56);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  color: var(--color-white);
  border: 1px solid rgba(255, 255, 255, 0.16);
  cursor: pointer;
  border-radius: 8px;
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.65),
    0 4px 8px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease;
}
.page-item:hover:not(.dots):not(.active) {
  background-color: rgba(255, 61, 0, 0.82);
  border-color: rgba(255, 175, 145, 0.42);
  transform: translateY(-2px);
  box-shadow:
    0 16px 30px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.page-item:active:not(.dots):not(.active) {
  transform: translateY(1px) scale(0.95);
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.7),
    inset 0 2px 4px rgba(0, 0, 0, 0.45);
  transition-duration: 0.08s;
}
.page-item.active {
  background-color: rgba(159, 27, 25, 0.78);
  color: var(--color-white);
  font-weight: bold;
  border-color: rgba(255, 130, 125, 0.32);
  box-shadow:
    0 12px 26px rgba(159, 27, 25, 0.55),
    0 4px 12px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
  cursor: default;
}
@media (max-width: 767px) {
  .pages-list {
    display: none;
  }
}
@media (max-width: 1279px) {
  .pagination {
    padding-top: 10px;
    padding-bottom: 20px;
  }
}
@media (min-width: 1024px) {
  .page-item {
    height: 39px;
    font-size: 20px;
  }
}
@media (min-width: 1920px) {
  .pagination {
    position: static;
    transform: none;
    padding-top: 10px;
    padding-bottom: 12px;
    margin-top: auto;
  }
}
@media (min-width: 2560px) {
  .pagination {
    padding-top: 14px;
    padding-bottom: 16px;
  }
}
</style>
