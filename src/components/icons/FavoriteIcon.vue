<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    :width="props.value?.width ?? 24"
    :height="props.value?.height ?? 24"
    :fill="props.value?.fill ?? '#000'"
  >
    <path
      d="m220.346 136.508-81.032 81.031a16.013 16.013 0 0 1-22.625 0L33.58 134.43a59.974 59.974 0 0 1 2.344-87.07c23.281-21.015 61.25-19.054 84.578 4.297l7.5 7.492 9.578-9.578a60.7 60.7 0 0 1 43.984-17.554 59.55 59.55 0 0 1 43.063 19.89c20.984 23.297 19.062 61.25-4.281 84.602"
    />
  </svg>
</template>

<script setup lang="ts">
interface SvgValue {
  width?: number | string
  height?: number | string
  fill?: string
}

const props = defineProps<{
  value?: SvgValue
}>()
</script>
