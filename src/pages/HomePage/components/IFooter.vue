<template>
  <footer class="container"></footer>
  <span class="content">GhostKato © {{ new Date().getFullYear() }}</span>
</template>

<style scoped>
.content {
  text-align: center;
}
@media (min-width: 768px) {
  .content {
    font-size: 20px;
  }
}
</style>
