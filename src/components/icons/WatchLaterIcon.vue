<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    :width="width ?? 26"
    :height="height ?? 26"
    :fill="'#ffffff'"
  >
    <path
      d="M2 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM5.5 16a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1z"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
  fill?: string
}>()
</script>
