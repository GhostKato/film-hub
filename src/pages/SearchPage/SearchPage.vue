<template>
  <IBackground>
    <div class="search-page">
      <div class="tab-buttons">
        <IButton
          variant="categories-btn"
          :class="{ active: activeComponent === 'text' }"
          @click="activeComponent = 'text'"
        >
          {{ t('search_page.text_search') }}
        </IButton>
        <IButton
          variant="categories-btn"
          :class="{ active: activeComponent === 'filter' }"
          @click="activeComponent = 'filter'"
        >
          {{ t('search_page.filter_search') }}
        </IButton>
      </div>

      <TextSearch v-if="activeComponent === 'text'" />
      <FilterSearch v-if="activeComponent === 'filter'" />
    </div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IBackground from '@/components/IBackground/IBackground.vue'
import TextSearch from './components/TextSearch.vue'
import FilterSearch from './components/FilterSearch.vue'
import IButton from '@/components/IButton/IButton.vue'
import { useI18n } from 'vue-i18n'

const activeComponent = ref<'text' | 'filter'>('text')

const { t } = useI18n()
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
}

.tab-buttons {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

@media (min-width: 768px) {
  .search-page {
    display: block;
  }
  .tab-buttons {
    padding-left: 20px;
    gap: 10px;
  }
}
</style>
