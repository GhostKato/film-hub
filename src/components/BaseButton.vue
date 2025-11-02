<template>
  <component
    :is="componentType"
    :to="to"
    :href="href"
    :type="buttonType"
    :class="['base-button', variant]"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  to?: string
  href?: string
  type?: string
  variant?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['click'])

const componentType = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

const buttonType = computed(() => props.type || 'button')

const handleClick = (e: Event) => {
  if (!props.to && !props.href) emit('click', e)
}
</script>

<style scoped>
.base-button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  transition: color 0.2s;
  cursor: pointer;
}

.header-link {
  text-decoration: none;
  font-size: 24px;
}

.header-link:hover {
  color: #3c0000;
}

.router-link-active {
  color: #9f1b19;
}

.button {
  background-color: #9f1b19;
  border-radius: 8px;
  width: 200px;
  height: 50px;
  margin-bottom: 20px;
}
.button:hover {
  background-color: #3c0000;
}
</style>
