<template>
  <div class="search-bar">
    <input
      class="input"
      v-model="query"
      @keyup.enter="search"
      type="text"
      placeholder="Search movies, series, anime..."
    />
    <BaseButton variant="search" @click="search"> Search </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../BaseButton/BaseButton.vue'

const query = ref('')
const router = useRouter()

const search = () => {
  if (!query.value.trim()) return
  router.push({ path: '/search/multi', query: { query: query.value } })
}
</script>

<style scoped>
.search-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.input {
  padding: 8px;
  border-radius: 8px;
  border: none;
  width: 250px;
  color: white;
  background-color: #1a1a1a;
}

.input:focus {
  outline: 1px solid #9f1b19;
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
