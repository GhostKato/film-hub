<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    :width="size"
    :height="size"
    :style="{ color }"
  >
    <path
      fill="currentColor"
      stroke-miterlimit="10"
      d="M3 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2z"
      transform="scale(8.53333)"
    />
  </svg>
</template>

<script setup lang="ts">
const { size, color } = defineProps({
  size: { type: [String, Number], default: 30 },
  color: { type: String, default: 'currentColor' },
})
</script>
