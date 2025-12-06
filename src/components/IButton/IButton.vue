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
  transition: background-color 0.5s ease;
  cursor: pointer;
  font-size: 16px;
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
.big-search-btn {
  background-color: var(--color-red);
  border-radius: 8px;
  width: 60px;
  height: 39px;
  border: none;
}
.big-search-btn:hover {
  background-color: var(--color-hover);
}
.small-search-btn {
  background-color: var(--color-red);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
}
.small-search-btn:hover {
  background-color: var(--color-hover);
}
.is-disabled {
  background-color: var(--color-grey) !important;
  filter: brightness(0.7);
  cursor: not-allowed !important;
  pointer-events: none;
}

.is-disabled svg,
.is-disabled svg * {
  opacity: 1 !important;
  fill: currentColor !important;
}
/* SearchBar component, clear button */
.big-clean-btn {
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
.big-clean-btn:hover {
  color: var(--color-hover);
}
.small-clean-btn {
  position: absolute;
  right: -3px;
  top: -3px;
  background: transparent;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  font-size: 18px;
  padding: 8px 12px;
  cursor: pointer;
}
.small-clean-btn:hover {
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
/* CollectionIndicator component*/
.indicator-btn {
  background-color: var(--color-transparent);
  border: none;
  border-radius: 8px;
  padding: 2px;
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
/* ModalAuth components, auth navigation button */
.modal-auth-nav-btn {
  flex: 1;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  background: var(--color-dark-grey);
}
.modal-auth-nav-btn:hover {
  background: var(--color-hover);
}
.modal-auth-nav-btn.active {
  background: var(--color-red);
}
/* MoviesPage, SeriesPage, CollectionPage components, categories button */
.categories-btn {
  padding: 4px 3px;
  border: none;
  border-radius: 8px;
  background: var(--color-dark-grey);
  cursor: pointer;
  transition: 0.3s;
}
.categories-btn.active {
  background: var(--color-red);
  color: var(--color-white);
}
.categories-btn:hover {
  background: var(--color-hover);
}
/* ShareButton component, share button */
.share-btn {
  background-color: var(--color-red);
  border: none;
  border-radius: 8px;
  padding: 5px;
}
.share-btn:hover {
  background-color: var(--color-hover);
}
@media (min-width: 768px) {
  .big-search-btn {
    width: 90px;
    height: 48px;
  }
  .small-search-btn {
    width: 29px;
    height: 29px;
  }
  .big-clean-btn {
    right: 1px;
    top: 6px;
  }
  .collection-btn {
    font-size: 20px;
  }
  .share-btn {
    font-size: 20px;
    align-self: flex-start;
  }
  .auth-btn {
    font-size: 20px;
    width: 210px;
  }
  .modal-auth-nav-btn {
    font-size: 20px;
  }
  .categories-btn {
    padding: 5px;
  }
}
@media (min-width: 1024px) {
  .header-link {
    font-size: 30px;
  }
  .big-search-btn {
    font-size: 20px;
  }
  .small-search-btn {
    width: 32px;
    height: 32px;
  }
  .big-clean-btn {
    top: 7px;
  }
  .small-clean-btn {
    right: -2px;
    top: -1px;
  }
  .categories-btn {
    font-size: 20px;
  }
}
@media (min-width: 1920px) {
  .categories-btn {
    padding: none;
    height: 33px;
    width: 210px;
  }
}
@media (min-width: 2560px) {
  .small-search-btn {
    width: 43px;
    height: 43px;
  }
  .categories-btn {
    height: 43px;
  }
  .small-clean-btn {
    top: 4px;
  }
}
</style>
