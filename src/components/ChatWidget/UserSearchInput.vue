<template>
  <input
    :value="modelValue"
    type="text"
    class="user-search-input"
    :placeholder="placeholder || $t('chat.search_nickname_placeholder')"
    @input="onInput"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.user-search-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg);
  color: var(--color-white);
  font-size: 13px;
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition:
    border-color 0.2s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}

.user-search-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

.user-search-input:hover {
  border-color: var(--color-hover);
  background-color: var(--glass-modal);
}

.user-search-input:focus {
  border-color: var(--color-red);
  background-color: var(--glass-modal);
  box-shadow:
    0 0 10px rgba(159, 27, 25, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
</style>
