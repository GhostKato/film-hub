<template>
  <div class="search-bar">
    <div class="position">
      <input
        class="input"
        v-model="query"
        @keyup.enter="search"
        type="text"
        :placeholder="t('search_multi_page.placeholder')"
      />
      <BaseButton v-if="query" variant="clear" @click="clearQuery">✖</BaseButton>
    </div>
    <BaseButton variant="search" @click="search">{{ $t('search_multi_page.button') }}</BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '../BaseButton/BaseButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const query = ref('')
const router = useRouter()
const route = useRoute()

watch(
  () => route.query.query,
  (newQuery) => {
    query.value = (newQuery as string) || ''
  },
  { immediate: true },
)

const search = () => {
  if (!query.value.trim()) return
  router.push({ path: '/search/multi', query: { query: query.value } })
}

const clearQuery = () => {
  query.value = ''
  if (route.path === '/search/multi') {
    router.push({ path: '/search/multi' })
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.position {
  position: relative;
}

.input {
  padding: 10px 35px 10px 10px;
  border-radius: 8px;
  border: none;
  width: 230px;
  color: var(--color-white);
  background-color: var(--color-dark-grey);
}

.input:focus {
  outline: 1px solid var(--color-red);
}

.clear-btn:hover {
  opacity: 1;
}

button {
  padding: 8px 12px;
  cursor: pointer;
}

@media (min-width: 768px) {
  .input {
    width: 340px;
    font-size: 24px;
  }
}
@media (min-width: 1024px) {
  .input {
    width: 700px;
  }
}
</style>
