<template>
  <div class="custom-select" ref="selectRef">
    <div class="select-trigger" @click="toggle" :class="{ open: isOpen }">
      <span class="current-label">{{ selectedLabel }}</span>
      <span class="width-sizer" aria-hidden="true">
        <span v-for="option in options" :key="String(option.value)">
          {{ option.label }}
        </span>
      </span>
    </div>

    <div v-if="isOpen" class="options-dropdown">
      <div
        v-for="option in options"
        :key="String(option.value)"
        class="option"
        :class="{ active: modelValue === option.value }"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | undefined">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option<T> {
  label: string
  value: T
}

const props = defineProps<{
  options: Option<T>[]
  modelValue: T
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const toggle = () => (isOpen.value = !isOpen.value)

const selectedLabel = computed(() => {
  const found = props.options.find((opt) => opt.value === props.modelValue)
  return found ? found.label : ''
})

const selectOption = (val: T) => {
  emit('update:modelValue', val)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 165px;
  user-select: none;
}
.select-trigger {
  width: 100%;
  height: 27px;
  display: inline-grid;
  align-items: center;
  justify-items: center;
  border-radius: 8px;
  color: var(--color-white);
  background-color: rgba(34, 38, 42, 0.56);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  cursor: pointer;
  font-size: 16px;
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.65),
    0 4px 8px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    border-color 0.2s ease,
    background-color 0.25s ease;
}
.current-label {
  grid-area: 1 / 1;
}
.width-sizer {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}
.select-trigger:hover,
.select-trigger.open {
  border-color: var(--color-hover);
  transform: translateY(-2px);
  box-shadow:
    0 16px 30px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.select-trigger:active {
  transform: translateY(1px) scale(0.97);
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.7),
    inset 0 2px 4px rgba(0, 0, 0, 0.45);
  transition-duration: 0.08s;
}
.options-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background-color: rgba(24, 28, 32, 0.78);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 265px;
  box-shadow:
    0 18px 38px rgba(0, 0, 0, 0.85),
    0 6px 14px rgba(0, 0, 0, 0.6);
  scrollbar-width: thin;
  scrollbar-color: var(--color-hover) transparent;
  padding-right: 4px;
}
.options-dropdown::-webkit-scrollbar {
  display: block;
  width: 5px;
}
.options-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
.options-dropdown::-webkit-scrollbar-thumb {
  background-color: var(--color-hover);
  border-radius: 10px;
}
.options-dropdown::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-white);
}
.option {
  padding: 10px 12px;
  color: var(--color-white);
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s;
}
.option:hover {
  background-color: rgba(255, 61, 0, 0.82);
}
.option.active {
  background-color: rgba(159, 27, 25, 0.85);
}
@media (min-width: 768px) {
  .custom-select {
    width: max-content;
    min-width: 65px;
  }
  .select-trigger {
    height: auto;
    padding: 5px 12px;
    white-space: nowrap;
  }
  .options-dropdown {
    min-width: 100%;
    width: max-content;
  }
  .option {
    white-space: nowrap;
    padding: 10px 12px;
    text-align: center;
  }
}
@media (min-width: 1024px) {
  .select-trigger,
  .option {
    font-size: 20px;
  }
}
@media (min-width: 2560px) {
  .custom-select {
    min-width: 80px;
  }
  .select-trigger {
    height: 43px;
  }
}
</style>
