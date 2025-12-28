<template>
  <Transition name="slide-right">
    <div
      v-if="modalStore.modals.release"
      class="modal-release-wrapper"
      @click.self="modalStore.close('release')"
    >
      <div class="release-list">
        <div v-if="!releaseList.length" class="empty-container">
          <p>{{ $t('modal_release.empty') }}</p>
        </div>

        <div v-else class="release-container">
          <div
            v-for="item in releaseList"
            :key="item.id"
            class="release-card"
            @click="goToMedia(item)"
          >
            <img
              :src="getImageUrl(item.poster_path, 'poster', 'w92')"
              :alt="item.title || item.name"
              class="img"
            />

            <div class="info">
              <h4 class="title">{{ item.title ?? item.name ?? '' }}</h4>
              <p class="type">
                {{
                  item.media_type === 'tv' || (!item.media_type && item.name && !item.title)
                    ? $t('media_list.type_series')
                    : $t('media_list.type_movie')
                }}
              </p>
            </div>
          </div>
          <IButton class="close" @click="clearAllReleases" variant="release-clear-all-btn">
            {{ $t('modal_release.clear_all') }}
          </IButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal'
import { getImageUrl } from '@/utils/getImageUrl'
import type { TmdbItemType } from '@/types/media'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useMediaStore } from '@/stores/media'
import IButton from '../IButton/IButton.vue'
const modalStore = useModalStore()
const mediaStore = useMediaStore()
const router = useRouter()

const releaseList = computed(() => mediaStore.releaseList())

const goToMedia = (item: TmdbItemType) => {
  modalStore.close('release')
  mediaStore.removeRelease(item)
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie')
  router.push({
    name: 'media',
    params: { type, id: item.id },
  })
}

function clearAllReleases() {
  mediaStore.removeAllRelease()
  modalStore.close('release')
}
</script>

<style scoped>
.modal-release-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  top: 15px;
  right: 20px;
  z-index: 50;
  pointer-events: all;
}
.release-list {
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}
.release-container,
.empty-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--color-transparent-black);
  backdrop-filter: blur(14px) saturate(160%);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-grey);
}
.release-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--color-transparent-black);
  border-radius: 8px;
  padding: 5px;
  border: 1px solid var(--color-grey);
  cursor: pointer;
}
.img {
  width: 50px;
  height: 75px;
  border-radius: 8px;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.title {
  text-shadow: 0 0 15px var(--color-shadow-black);
  margin: 0;
  margin-bottom: 10px;
  font-size: 20px;
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
