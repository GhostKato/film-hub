<template>
  <component
    :is="componentType"
    :to="to"
    :href="href"
    :type="buttonType"
    :class="['base', variant, { 'is-disabled': disabled }]"
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
  e.stopPropagation()
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
  transition: all 0.5s ease;
  cursor: pointer;
  font-size: 16px;
}

.big-btn-collection,
.form-submit-btn,
.menu-auth-btn,
.share-btn,
.auth-nav-btn.active,
.tab-btn.active,
.big-search-btn,
.small-search-btn {
  background-color: var(--color-red);
}

.big-clean-btn:hover,
.small-clean-btn:hover,
.header-link:hover {
  color: var(--color-hover);
}

.tab-btn.active:hover,
.big-btn-collection:hover,
.auth-nav-btn:hover,
.form-submit-btn:hover,
.menu-auth-btn:hover,
.language-btn:hover,
.tab-btn:hover,
.share-btn:hover,
.big-search-btn:hover,
.small-search-btn:hover {
  background-color: var(--color-hover);
}

.is-disabled {
  background-color: var(--color-grey) !important;
  filter: brightness(0.3);
  cursor: not-allowed !important;
  pointer-events: none;
}

.is-disabled svg,
.is-disabled svg * {
  opacity: 1 !important;
  fill: currentColor !important;
}

@media (min-width: 1024px) {
  .big-btn-collection,
  .auth-nav-btn,
  .form-submit-btn,
  .tab-btn,
  .share-btn,
  .big-search-btn {
    font-size: 20px;
  }
}
</style>
<style scoped src="./styles/header.css"></style>
<style scoped src="./styles/search.css"></style>
<style scoped src="./styles/collection.css"></style>
<style scoped src="./styles/menu.css"></style>
<style scoped src="./styles/auth.css"></style>
<style scoped src="./styles/pages.css"></style>
<style scoped src="./styles/pagination.css"></style>
