<template>
  <div class="background">
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.background {
  width: 100%;
  overflow-y: auto;
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    #000000 10%,
    #330000 25%,
    #8b0000 50%,
    #330000 75%,
    #000000 90%
  );
  position: relative;
}

.background::before {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 200%;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 180, 180, 0.05),
    rgba(255, 180, 180, 0.05) 2px,
    transparent 2px,
    transparent 12px
  );
  animation:
    moveLines 6s linear infinite,
    pulseLines 2s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 1;
}

@keyframes moveLines {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50px);
  }
}

@keyframes pulseLines {
  0% {
    opacity: 0.05;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.05;
  }
}
.content {
  position: relative;
  z-index: 2;
}
</style>
