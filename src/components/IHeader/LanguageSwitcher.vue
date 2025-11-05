<template>
  <div class="language-switcher">
    <button class="switcher-button" @click="toggleDropdown">
      {{ currentLabel }}
      <span class="arrow">{{ isOpen ? '▲' : '▼' }}</span>
    </button>

    <ul v-if="isOpen" class="dropdown">
      <li
        v-for="langOption in languages"
        :key="langOption.code"
        @click="selectLang(langOption.code)"
        :class="{ active: currentLang === langOption.code }"
      >
        {{ langOption.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useLanguageStore } from '@/stores/language.'

const languageStore = useLanguageStore()
const isOpen = ref(false)

const languages: { code: 'en' | 'uk' | 'ru'; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'uk', label: 'UA' },
  { code: 'ru', label: 'RU' },
]

const currentLang = computed(() => languageStore.lang)
const currentLabel = computed(
  () => languages.find((l) => l.code === currentLang.value)?.label || 'EN',
)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}
function selectLang(code: 'en' | 'uk' | 'ru') {
  languageStore.setLanguage(code)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.language-switcher')) isOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
}
.switcher-button {
  background: transparent;
  border: 1px solid var(--color-white);
  color: var(--color-white);
  padding: 5px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}
.arrow {
  font-size: 0.7em;
}
.dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  background: var(--color-black);
  border: 1px solid var(--color-grey);
  border-radius: 5px;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  min-width: 60px;
  z-index: 10;
}
.dropdown li {
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.dropdown li:hover {
  background: var(--color-hover);
}
.dropdown li.active {
  background: var(--color-red);
  font-weight: bold;
}
</style>
