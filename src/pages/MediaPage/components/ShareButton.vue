<template>
  <IButton variant="share-btn" @click="share">
    {{ $t('media_page.share_btn') }}
  </IButton>
</template>

<script setup lang="ts">
import IButton from '@/components/IButton/IButton.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})

const share = async () => {
  const shareText = `${props.title}\n{{ $t('share_button.message') }}\n${window.location.href}`

  if (navigator.share) {
    try {
      await navigator.share({ text: shareText })
      return
    } catch (e) {
      console.log('Share API error:', e)
    }
  }

  try {
    await navigator.clipboard.writeText(shareText)
  } catch (e) {
    console.log('Clipboard error:', e)
  }
}
</script>

<style scoped></style>
