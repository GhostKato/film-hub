<template>
  <div class="search-bar">
    <input
      v-model="query"
      @keyup.enter="search"
      type="text"
      placeholder="Search movies, series, anime..."
    />
    <button @click="search">🔍</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
  gap: 10px;
}
input {
  padding: 8px;
  border-radius: 4px;
  border: none;
  width: 250px;
}
button {
  padding: 8px 12px;
  cursor: pointer;
}
</style>
