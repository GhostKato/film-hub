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
  aspect-ratio: 9 / 17;
  position: relative;
  background: var(--color-transparent-grey);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.skeleton-poster {
  width: 100%;
  flex: 1;
  background: #1f1f1f;
  position: relative;
  overflow: hidden;
}

.skeleton-info {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.skeleton-title {
  width: 80%;
  height: 16px;
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

@media (min-width: 640px) {
  .skeleton-card {
    aspect-ratio: 9 / 16;
  }
}

@media (min-width: 768px) {
  .skeleton-card {
    aspect-ratio: 9 / 17;
  }
}

@media (min-width: 1024px) {
  .skeleton-card {
    aspect-ratio: 9 / 16;
  }
}

@media (min-width: 1920px) {
  .skeleton-card {
    aspect-ratio: 9 / 16;
  }
}
</style>
