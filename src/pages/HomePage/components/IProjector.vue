<template>
  <div class="projector-light" :class="{ hide: hideProjector }"></div>
</template>

<script setup lang="ts">
interface Props {
  hideProjector: boolean
}

const { hideProjector } = defineProps<Props>()
</script>

<style scoped>
.projector-light {
  position: absolute;
  width: 140%;
  height: 140%;
  top: -20%;
  left: -20%;
  background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.8), transparent 60%);
  filter: blur(80px);
  opacity: 1;
  z-index: 20;
  transition:
    opacity 2s ease-in-out,
    transform 2s ease-in-out;
}
.projector-light.hide {
  opacity: 0;
  transform: scale(1.2);
  pointer-events: none;
}
</style>
