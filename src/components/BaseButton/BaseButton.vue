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
  color: #ff3d00;
}

.router-link-active {
  color: #9f1b19;
}

.search {
  background-color: #9f1b19;
  border-radius: 8px;
  width: 60px;
  height: 40px;
  border: none;
}
.search:hover {
  background-color: #ff3d00;
}
@media (min-width: 768px) {
  .search {
    width: 90px;
    height: 50px;
  }
}
@media (min-width: 1024px) {
  .header-link {
    font-size: 30px;
  }
}
</style>
