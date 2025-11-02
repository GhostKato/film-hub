<template>
  <div class="cinema-background">
    <slot />
  </div>
</template>

<style scoped>
.cinema-background {
  width: 100%;
  height: calc(100vh - 100px);
  background: linear-gradient(
    180deg,
    #000000 10%,
    #330000 25%,
    #8b0000 50%,
    #330000 75%,
    #000000 90%
  );
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.cinema-background::before {
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

h1 {
  position: relative;
  color: #fff;
  font-size: 40px;
  font-weight: bold;
  z-index: 2;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
}
</style>
