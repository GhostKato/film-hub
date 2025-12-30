<template>
  <Transition name="slide-right">
    <div
      v-if="modalStore.modals.release"
      class="modal-release-wrapper"
      @click.self="modalStore.close('release')"
    >
      <div class="release-list">
        <div v-if="!releaseList.length" class="empty-container">
          <p class="empty">{{ $t('modal_release.empty') }}</p>
        </div>

        <div v-else class="release-container">
          <h2 class="main-title">{{ $t('modal_release.title') }}</h2>
          <IButton @click="modalStore.close('release')" variant="close"><XIcon /></IButton>
          <div class="release-scroll">
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
                <div class="icons-info-cont">
                  <div class="icons-info-item">
                    <FavoriteIcon :class="{ active: isFavorite(item) }" />
                  </div>
                  <div class="icons-info-item">
                    <WatchLaterIcon :class="{ active: isWatchLater(item) }" />
                  </div>
                </div>
                <div class="remove-cont">
                  <IButton @click="mediaStore.removeRelease(item)" variant="remove-release-btn"
                    ><XIcon />
                  </IButton>
                </div>
              </div>
            </div>
          </div>

          <IButton @click="clearAllReleases" variant="release-clear-all-btn">
            {{ $t('modal_release.clear_all') }}
          </IButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useModalStore } from '@/stores/modal'
import { useMediaStore } from '@/stores/media'
import { getImageUrl } from '@/utils/getImageUrl'
import type { FirebaseItemType } from '@/types/media'
import IButton from '../IButton/IButton.vue'
import XIcon from '../icons/XIcon.vue'
import FavoriteIcon from '../icons/FavoriteIcon.vue'
import WatchLaterIcon from '../icons/WatchLaterIcon.vue'
import { autoClose } from '@/utils/autoClose'

const modalStore = useModalStore()
const mediaStore = useMediaStore()
const router = useRouter()

const releaseList = computed(() => mediaStore.releaseList())

const goToMedia = (item: FirebaseItemType) => {
  modalStore.close('release')

  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie')

  router.push({
    name: 'media',
    params: { type, id: item.id },
  })
}

const isFavorite = (item: FirebaseItemType) => {
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie')

  return mediaStore.favoriteList().some((i) => i.id === item.id && i.media_type === type)
}

const isWatchLater = (item: FirebaseItemType) => {
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie')

  return mediaStore.watchLaterList().some((i) => i.id === item.id && i.media_type === type)
}

const clearAllReleases = () => {
  mediaStore.removeAllRelease()
  modalStore.close('release')
}

autoClose('release')
</script>

<style scoped>
.modal-release-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  top: 10px;
  right: 10px;
  z-index: 50;
}
.release-list {
  pointer-events: all;
}
.empty {
  text-align: center;
}
.release-container,
.empty-container {
  display: flex;
  flex-direction: column;
  background-color: var(--color-transparent-black);
  backdrop-filter: blur(14px) saturate(160%);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-grey);
  width: 355px;
}
.main-title {
  margin: 0;
  font-size: 20px;
  text-shadow: 0 0 15px var(--color-shadow-black);
  margin-bottom: 10px;
}
.release-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  --item-height: 96px;
  --max-items: 7;
  max-height: calc(var(--item-height) * var(--max-items));
}
:deep(.release-scroll::-webkit-scrollbar) {
  display: none;
}
:deep(.release-scroll) {
  scrollbar-width: none;
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
  position: relative;
}
.release-card:hover {
  border-color: var(--color-hover);
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
  margin: 0;
  font-size: 20px;
  text-shadow: 0 0 15px var(--color-shadow-black);
}
.icons-info-cont {
  display: flex;
  gap: 5px;
  align-items: center;
  position: absolute;
  bottom: 2px;
  right: 50px;
}
.icons-info-item svg.active {
  color: var(--color-red);
}
.remove-cont {
  position: absolute;
  bottom: 5px;
  right: 2px;
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
@media (min-width: 1920px) {
  .modal-release-wrapper {
    right: 20px;
  }
  .release-scroll {
    --max-items: 7;
  }
}
@media (min-width: 2560px) {
  .release-scroll {
    --max-items: 11;
  }
}
</style>
