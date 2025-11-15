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
          <img :src="getImageUrl(person.profile_path!, 'profile', 'w185')" :alt="person.name" />
          <div class="name">{{ person.name }}</div>
          <div class="character" v-if="person.character">as {{ person.character }}</div>
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
          <img :src="getImageUrl(person.profile_path!, 'profile', 'w185')" :alt="person.name" />
          <div class="name">{{ person.name }}</div>
          <div class="character">
            {{ person.jobs.join(', ') }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getImageUrl } from '@/utils/getImageUrl'

interface Person {
  id: number
  name: string
  profile_path?: string
  character?: string
  job?: string
}

const props = defineProps<{
  people: Person[]
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
  margin-bottom: 15px;
}

.people-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

.person-card {
  width: 130px;
  text-align: center;
  color: var(--color-white);
  text-decoration: none;
  transition: transform 0.2s;
}

.person-card:hover {
  transform: scale(1.05);
}

.person-card img {
  width: 130px;
  height: 190px;
  border-radius: 8px;
  object-fit: cover;
}

.name {
  font-weight: bold;
  margin-top: 8px;
}

.character {
  font-size: 0.9rem;
  color: var(--color-light-grey);
}
</style>
