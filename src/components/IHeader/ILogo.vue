<template>
  <div class="logo-wrapper">
    <div class="gradient-bg"></div>
    <img :src="logo" alt="Film Hub" class="logo" />
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/images/logo.png'
</script>

<style scoped>
.logo-wrapper {
  position: relative;
  display: inline-block;
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.3s ease;
  animation: logoGlowPulse 3.8s ease-in-out infinite;
}

.logo-wrapper:hover {
  transform: translateY(-2px) scale(1.04);
}

.logo-wrapper:active {
  transform: translateY(1px) scale(0.97);
  transition-duration: 0.08s;
}

.gradient-bg {
  position: absolute;
  bottom: 2%;
  right: 1%;
  width: 44%;
  height: 86%;
  background: linear-gradient(
    115deg,
    #0a0a0a 0%,
    #262626 25%,
    #a3a3a3 42%,
    #ffffff 50%,
    #a3a3a3 58%,
    #262626 75%,
    #0a0a0a 100%
  );
  background-size: 250% 100%;
  animation: letterShimmer 3.8s ease-in-out infinite;
  z-index: 0;
  border-radius: 8px;
}

.logo {
  width: 200px;
  height: auto;
  position: relative;
  z-index: 1;
  display: block;
}

@keyframes logoGlowPulse {
  0%,
  100% {
    filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 8px rgba(159, 27, 25, 0.4));
  }
  50% {
    filter: drop-shadow(0 14px 24px rgba(0, 0, 0, 0.95))
      drop-shadow(0 0 16px rgba(255, 61, 0, 0.72));
  }
}

@keyframes letterShimmer {
  0% {
    background-position: 130% 0;
  }
  55%,
  100% {
    background-position: -30% 0;
  }
}

@media (min-width: 1024px) {
  .logo {
    width: 250px;
  }
}

@media (min-width: 1920px) {
  .logo-wrapper {
    margin-right: 220px;
  }
}

@media (min-width: 2560px) {
  .logo-wrapper {
    margin-right: 250px;
  }
}
</style>
