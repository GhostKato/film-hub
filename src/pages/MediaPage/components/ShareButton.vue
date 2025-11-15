<template>
  <IButton variant="share-btn" @click="share">{{ $t('media_page.share_btn') }}</IButton>
</template>

<script setup lang="ts">
import IButton from '@/components/IButton/IButton.vue'
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})

const share = async () => {
  const data = {
    title: props.title,
    text: 'Подивись це!',
    url: window.location.href,
  }

  if (navigator.share) {
    try {
      await navigator.share(data)
      return
    } catch (e) {
      console.log(e)
    }
  }

  await navigator.clipboard.writeText(data.url)
}
</script>
