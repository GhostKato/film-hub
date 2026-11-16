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
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;
  cursor: pointer;
  font-size: 16px;
}

/* Лёгкое дымчатое стекло для неактивных вкладок и обычных кнопок */
.big-btn-collection,
.small-btn-collection,
.form-submit-btn,
.menu-auth-btn,
.menu-edit-btn,
.language-btn,
.share-btn,
.auth-nav-btn,
.tab-btn,
.big-search-btn,
.small-search-btn,
.release-clear-all-btn,
.pagination-btn {
  background-color: var(--glass-bg-light);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.65),
    0 4px 8px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

/* Плавное всплытие при наведении только для активных кнопок */
.big-btn-collection:hover:not(.is-disabled),
.small-btn-collection:hover:not(.is-disabled),
.form-submit-btn:hover:not(.is-disabled),
.menu-auth-btn:hover:not(.is-disabled),
.menu-edit-btn:hover:not(.is-disabled),
.language-btn:hover:not(.is-disabled),
.share-btn:hover:not(.is-disabled),
.auth-nav-btn:hover:not(.is-disabled),
.tab-btn:hover:not(.is-disabled),
.big-search-btn:hover:not(.is-disabled),
.small-search-btn:hover:not(.is-disabled),
.release-clear-all-btn:hover:not(.is-disabled),
.pagination-btn:hover:not(.is-disabled):not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--glass-border-bright);
  box-shadow:
    0 16px 30px rgba(0, 0, 0, 0.8),
    0 6px 12px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
}

/* Тактильный эффект нажатия для активных кнопок */
.base:active:not(.is-disabled):not(:disabled) {
  transform: translateY(1px) scale(0.96);
  transition-duration: 0.08s;
}

.big-btn-collection:active:not(.is-disabled),
.small-btn-collection:active:not(.is-disabled),
.form-submit-btn:active:not(.is-disabled),
.menu-auth-btn:active:not(.is-disabled),
.menu-edit-btn:active:not(.is-disabled),
.language-btn:active:not(.is-disabled),
.share-btn:active:not(.is-disabled),
.auth-nav-btn:active:not(.is-disabled),
.tab-btn:active:not(.is-disabled),
.big-search-btn:active:not(.is-disabled),
.small-search-btn:active:not(.is-disabled),
.release-clear-all-btn:active:not(.is-disabled),
.pagination-btn:active:not(.is-disabled):not(:disabled) {
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.7),
    inset 0 2px 4px rgba(0, 0, 0, 0.45);
}

/* Полупрозрачное рубиновое стекло для акцентных кнопок и активной пагинации */
.form-submit-btn,
.menu-auth-btn,
.auth-nav-btn.active,
.tab-btn.active,
.big-search-btn,
.small-search-btn,
.release-clear-all-btn,
.pagination-btn {
  background-color: var(--glass-red);
  border-color: var(--glass-border);
}

.tab-btn.active,
.auth-nav-btn.active {
  box-shadow:
    0 12px 26px rgba(159, 27, 25, 0.55),
    0 4px 12px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
}

.big-clean-btn:hover,
.small-clean-btn:hover,
.header-link:hover,
.close:hover,
.remove-release-btn:hover {
  color: var(--color-hover);
}

/* Яркое полупрозрачное стекло при наведении */
.tab-btn.active:hover,
.big-btn-collection:hover,
.auth-nav-btn:hover,
.form-submit-btn:hover,
.menu-auth-btn:hover,
.language-btn:hover,
.tab-btn:hover,
.share-btn:hover,
.big-search-btn:hover,
.small-search-btn:hover,
.release-clear-all-btn:hover,
.pagination-btn:hover:not(.is-disabled):not(:disabled) {
  background-color: var(--glass-hover);
  border-color: var(--glass-border-bright);
}

/* Неактивная (заблокированная) кнопка — максимально лёгкое приглушённое стекло */
.is-disabled {
  background-color: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.35) !important;
  cursor: not-allowed !important;
  pointer-events: none;
}

.is-disabled svg,
.is-disabled svg * {
  opacity: 1 !important;
  fill: currentColor !important;
}

.close {
  position: absolute;
  top: 8px;
  right: 4px;
  border-radius: 8px;
  border: none;
  background-color: transparent;
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
<style scoped src="./styles/release.css"></style>
