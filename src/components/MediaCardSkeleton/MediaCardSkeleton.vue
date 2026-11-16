<template>
  <div class="skeleton-card">
    <div class="skeleton-poster"></div>
    <div class="skeleton-info">
      <div class="skeleton-title"></div>
      <div class="skeleton-type"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  position: relative;
  background: var(--color-transparent-grey);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.skeleton-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  background: #1f1f1f;
  position: relative;
  overflow: hidden;
}

.skeleton-info {
  padding: 6px 8px;
  min-height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.skeleton-title {
  width: 80%;
  height: 15px;
  border-radius: 4px;
  background: #262626;
  position: relative;
  overflow: hidden;
}

.skeleton-type {
  width: 45%;
  height: 12px;
  border-radius: 4px;
  background: #222222;
  position: relative;
  overflow: hidden;
}

.skeleton-poster::after,
.skeleton-title::after,
.skeleton-type::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (min-width: 1920px) {
  .skeleton-info {
    padding: 4px 6px;
    min-height: 52px;
    height: 52px;
  }
}

@media (min-width: 2560px) {
  .skeleton-info {
    padding: 6px 8px;
    min-height: 62px;
    height: 62px;
  }
}
</style>
