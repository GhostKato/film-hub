<template>
  <div class="language-switcher">
    <IButton
      v-for="langOption in languages"
      :key="langOption.code"
      variant="language-btn"
      :class="{ active: currentLang === langOption.code }"
      @click="selectLang(langOption.code)"
    >
      {{ langOption.label }}
    </IButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import IButton from '@/components/IButton/IButton.vue'

const languageStore = useLanguageStore()

const languages: { code: 'en' | 'uk' | 'ru'; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'uk', label: 'UA' },
  { code: 'ru', label: 'RU' },
]

const currentLang = computed(() => languageStore.lang)

function selectLang(code: 'en' | 'uk' | 'ru') {
  languageStore.setLanguage(code)
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  justify-content: center;
  flex: 1;
  gap: 8px;
}

.language-switcher .active {
  background: var(--color-red);
  font-weight: bold;
}
</style>
