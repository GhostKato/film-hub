<template>
  <div class="media-list">
    <div v-if="loaderStore.isListLoading" class="media-grid">
      <MediaCardSkeleton v-for="n in 20" :key="n" />
    </div>

    <div
      v-else-if="
        (!isMultiSearchPage && !itemsWithPoster.length) ||
        (searchStore.notification && !itemsWithPoster.length)
      "
      class="empty"
    >
      <p>{{ $t('media_list.not_found') }}</p>
    </div>

    <div v-else class="media-grid">
      <div
        v-for="item in itemsWithPoster"
        :key="item.id"
        class="media-card"
        @click="goToMedia(item)"
      >
        <div class="poster-box">
          <MediaInfo :item="item" />
          <CollectionButtons :media="item" />

          <img
            :src="getImageUrl(item.poster_path, 'poster', 'w500')"
            :alt="item.title || item.name"
          />
        </div>

        <div class="info">
          <h3 class="title">{{ item.title ?? item.name ?? '' }}</h3>
          <p class="type">
            {{
              item.media_type === 'tv' || (!item.media_type && item.name && !item.title)
                ? $t('media_list.type_series')
                : $t('media_list.type_movie')
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { getImageUrl } from '@/utils/getImageUrl'
import CollectionButtons from '../../components/CollectionButtons/CollectionButtons.vue'
import { useSearchStore } from '@/stores/search'
import type { TmdbItemType } from '@/types/media'
import { useLoaderStore } from '@/stores/loader'
import MediaInfo from '../MediaInfo/MediaInfo.vue'
import MediaCardSkeleton from '@/components/MediaCardSkeleton/MediaCardSkeleton.vue'

const searchStore = useSearchStore()
const loaderStore = useLoaderStore()
const route = useRoute()

const props = defineProps<{
  items: TmdbItemType[]
  routePath?: string
}>()

const router = useRouter()

const itemsWithPoster = computed(() => props.items.filter((item) => item.poster_path))

const goToMedia = (item: TmdbItemType) => {
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie')
  router.push({
    name: 'media',
    params: { type, id: item.id },
  })
}
const isMultiSearchPage = route.path == '/multi-search'
</script>

<style scoped>
.media-list {
  padding: 10px;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.media-card {
  display: flex;
  flex-direction: column;
  background: var(--glass-card);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.65),
    0 4px 10px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}
.media-card:hover {
  transform: translateY(-6px) scale(1.03);
  border-color: var(--glass-border-bright);
  box-shadow:
    0 24px 44px rgba(0, 0, 0, 0.85),
    0 8px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  z-index: 10;
}
.poster-box {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
}
.poster-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  padding: 6px 8px;
  text-align: center;
  color: var(--color-white);
  background: linear-gradient(180deg, var(--glass-bg-light) 0%, rgba(10, 18, 14, 0.62) 100%);
  border-top: 1px solid var(--glass-border);
}
.title {
  font-size: 15px;
  line-height: 1.2;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.75);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.type {
  font-size: 13px;
  line-height: 1.15;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
}
.empty {
  text-align: center;
  color: var(--color-white);
  margin-top: 40px;
}
@media (min-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
@media (min-width: 1024px) {
  .empty {
    font-size: 20px;
  }
}
@media (min-width: 1920px) {
  .media-list {
    padding: 4px 20px;
  }
  .media-grid {
    grid-template-columns: repeat(10, 1fr);
    gap: 10px 12px;
  }
  .info {
    padding: 4px 6px;
    height: 52px;
  }
  .title {
    font-size: 14px;
    line-height: 1.15;
  }
  .type {
    font-size: 13px;
    font-weight: 500;
  }
}
@media (min-width: 2560px) {
  .media-list {
    padding: 10px 20px;
  }
  .media-grid {
    gap: 16px 12px;
  }
  .info {
    padding: 6px 8px;
    height: 62px;
  }
  .title {
    font-size: 15px;
  }
  .type {
    font-size: 14px;
  }
}
</style>
