<template>
  <Transition name="release-fade">
    <div
      v-if="modalStore.modals.release"
      class="modal-release-wrapper"
      @click.self="modalStore.close('release')"
    >
      <div class="release-list">
        <div class="release-container">
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
                  <IButton @click.stop="mediaStore.removeRelease(item)" variant="remove-release-btn"
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

autoClose('release', 20000)
</script>

<style scoped>
.modal-release-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 60px 12px 12px;
  background-color: rgba(5, 7, 10, 0.65);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 60;
}
.release-list {
  pointer-events: all;
}
.release-container,
.empty-container {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: rgba(24, 28, 32, 0.72);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 26px 54px rgba(0, 0, 0, 0.9),
    0 10px 22px rgba(0, 0, 0, 0.68),
    inset 0 1px 0 rgba(255, 255, 255, 0.26);
  width: 355px;
}
.main-title {
  margin: 0;
  font-size: 20px;
  padding-right: 28px;
  margin-bottom: 12px;
}
.release-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding: 2px;
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
  background-color: rgba(38, 42, 48, 0.52);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  cursor: pointer;
  position: relative;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}
.release-card:hover {
  transform: translateY(-2px);
  background-color: rgba(48, 54, 62, 0.68);
  border-color: var(--color-hover);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.72),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}
.img {
  width: 50px;
  height: 75px;
  border-radius: 8px;
  object-fit: cover;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-right: 36px;
}
.title {
  margin: 0;
  font-size: 18px;
}
.icons-info-cont {
  display: flex;
  gap: 5px;
  align-items: center;
  position: absolute;
  bottom: 2px;
  right: 46px;
}
.icons-info-item svg.active {
  color: var(--color-red);
}
.remove-cont {
  position: absolute;
  bottom: 5px;
  right: 2px;
}
.release-fade-enter-active,
.release-fade-leave-active {
  transition: opacity 0.3s ease;
}
.release-fade-enter-active .release-list,
.release-fade-leave-active .release-list {
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
}
.release-fade-enter-from,
.release-fade-leave-to {
  opacity: 0;
}
.release-fade-enter-from .release-list,
.release-fade-leave-to .release-list {
  transform: translateX(30px) scale(0.97);
  opacity: 0;
}
@media (min-width: 768px) {
  .modal-release-wrapper {
    padding-top: 75px;
  }
}
@media (min-width: 1920px) {
  .modal-release-wrapper {
    padding-right: 20px;
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
