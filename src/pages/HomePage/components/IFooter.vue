<template>
  <footer class="footer">
    <span class="content">GhostKato © {{ new Date().getFullYear() }}</span>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  z-index: 25;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.72) 100%);
}
.content {
  font-size: 13px;
  color: var(--color-light-grey);
  letter-spacing: 0.4px;
}
@media (min-width: 768px) {
  .content {
    font-size: 15px;
  }
}
</style>
