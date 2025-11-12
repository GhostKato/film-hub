<template>
  <component
    :is="componentType"
    :to="to"
    :href="href"
    :type="buttonType"
    :class="['base', variant]"
    @click="handleClick"
    :disabled="disabled"
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
  disabled?: boolean
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
  if (props.disabled) return
  if (!props.to && !props.href) emit('click', e)
}
</script>

<style scoped>
.base {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-white);
  transition: background-color 0.5s ease;
  cursor: pointer;
}
/* IHeader component, navigation buttons */
.header-link {
  text-decoration: none;
  font-size: 24px;
}
.header-link:hover {
  color: var(--color-hover);
}
.router-link-active {
  color: var(--color-red);
}
/* SearchBar component, search button */
.search-btn {
  background-color: var(--color-red);
  border-radius: 8px;
  width: 60px;
  height: 39px;
  border: none;
}
.search-btn:hover {
  background-color: var(--color-hover);
}
.search-btn:disabled {
  background-color: var(--color-grey);
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
/* SearchBar component, clear button */
.clear-btn {
  position: absolute;
  right: 0;
  top: 2px;
  background: transparent;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  font-size: 18px;
  padding: 8px 12px;
  cursor: pointer;
}
.clear-btn:hover {
  color: var(--color-hover);
}
/* LanguageSwitcher component, language buttons */
.language-btn {
  width: 50px;
  height: 30px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  gap: 5px;
  transition: all 0.3s;
  background-color: var(--color-black);
}
.language-btn:hover {
  background-color: var(--color-hover);
}
/* CollectionButtons component, collection button */
.collection-btn {
  background-color: var(--color-red);
  border: none;
  border-radius: 8px;
  padding: 5px;
}
.collection-btn:hover {
  background-color: var(--color-hover);
}
/* ModalMenu, FormAuth components, auth button */
.auth-btn {
  height: 40px;
  width: 160px;
  border: none;
  border-radius: 8px;
  background-color: var(--color-red);
}
.auth-btn:hover {
  background-color: var(--color-hover);
}
.auth-btn:disabled {
  background-color: var(--color-grey);
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
@media (min-width: 768px) {
  .search-btn {
    width: 90px;
    height: 48px;
    font-size: 24px;
  }
  .clear-btn {
    right: 1px;
    top: 6px;
  }
}
@media (min-width: 1024px) {
  .header-link {
    font-size: 30px;
  }
  .clear-btn {
    top: 7px;
  }
}
</style>
