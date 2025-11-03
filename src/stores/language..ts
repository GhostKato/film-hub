import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    lang: (localStorage.getItem('lang') as 'en' | 'uk' | 'ru') || 'uk',
  }),
  actions: {
    setLanguage(newLang: 'en' | 'uk' | 'ru') {
      this.lang = newLang
      localStorage.setItem('lang', newLang)
    },
  },
  getters: {
    isEnglish: (state) => state.lang === 'en',
    isUkrainian: (state) => state.lang === 'uk',
    isRussian: (state) => state.lang === 'ru',
  },
})
