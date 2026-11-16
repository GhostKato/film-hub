<template>
  <div>
    <div v-if="actors.length" class="section">
      <h2>{{ $t('media_page.actors_title') }}</h2>
      <div class="people-list">
        <router-link
          v-for="person in actors"
          :key="person.id"
          :to="`/person/${person.id}`"
          class="person-card"
        >
          <div class="photo-box">
            <img :src="getImageUrl(person.profile_path!, 'profile', 'w185')" :alt="person.name" />
          </div>
          <div class="info">
            <div class="name">{{ person.name }}</div>
            <div class="character" v-if="person.character">as {{ person.character }}</div>
          </div>
        </router-link>
      </div>
    </div>

    <div v-if="crewGrouped.length" class="section">
      <h2>{{ $t('media_page.production_crew_title') }}</h2>
      <div class="people-list">
        <router-link
          v-for="person in crewGrouped"
          :key="person.id"
          :to="`/person/${person.id}`"
          class="person-card"
        >
          <div class="photo-box">
            <img :src="getImageUrl(person.profile_path!, 'profile', 'w185')" :alt="person.name" />
          </div>
          <div class="info">
            <div class="name">{{ person.name }}</div>
            <div class="character">
              {{ person.jobs.join(', ') }}
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getImageUrl } from '@/utils/getImageUrl'
import type { PersonItemType } from '@/types/person'

const props = defineProps<{
  people: PersonItemType[]
}>()

const peopleWithPhoto = computed(() => props.people.filter((p) => p.profile_path))

const actors = computed(() => peopleWithPhoto.value.filter((p) => p.character))

const crewGrouped = computed(() => {
  const group = new Map<
    number,
    { id: number; name: string; profile_path?: string; jobs: string[] }
  >()

  peopleWithPhoto.value.forEach((p) => {
    if (p.job && !p.character) {
      if (!group.has(p.id)) {
        group.set(p.id, {
          id: p.id,
          name: p.name,
          profile_path: p.profile_path,
          jobs: [],
        })
      }
      group.get(p.id)!.jobs.push(p.job)
    }
  })

  return Array.from(group.values())
})
</script>

<style scoped>
.section {
  margin-bottom: 30px;
}

h2 {
  text-align: center;
  margin-bottom: 18px;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.85);
}

.people-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.person-card {
  width: 140px;
  display: flex;
  flex-direction: column;
  text-align: center;
  color: var(--color-white);
  text-decoration: none;
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
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.person-card:hover {
  transform: translateY(-6px) scale(1.04);
  border-color: var(--glass-border-bright);
  box-shadow:
    0 24px 44px rgba(0, 0, 0, 0.85),
    0 8px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  z-index: 5;
}

.photo-box {
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
}

.photo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  padding: 6px 8px;
  background: linear-gradient(180deg, var(--glass-bg-light) 0%, rgba(10, 18, 14, 0.62) 100%);
  border-top: 1px solid var(--glass-border);
}

.name {
  font-size: 14px;
  font-weight: bold;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.75);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.character {
  font-size: 12px;
  line-height: 1.15;
  color: rgba(255, 255, 255, 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
