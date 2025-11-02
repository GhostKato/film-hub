<template>
  <div>
    <div class="curtain curtain-left" :class="{ open: isOpen }"></div>
    <div class="curtain curtain-right" :class="{ open: isOpen }"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

const { isOpen } = defineProps<Props>()
</script>

<style scoped>
.curtain {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background: repeating-linear-gradient(90deg, #8b0000 0%, #a00000 10%, #8b0000 20%);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.8);
  transition: transform 2.5s ease-in-out;
  z-index: 30;
}
.curtain-left {
  left: 0;
  transform-origin: left;
}
.curtain-right {
  right: 0;
  transform-origin: right;
}
.curtain-left.open {
  transform: translateX(-100%);
}
.curtain-right.open {
  transform: translateX(100%);
}
</style>
