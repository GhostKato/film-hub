<template>
  <div v-if="peopleWithPhoto.length" class="people-list">
    <router-link
      v-for="person in peopleWithPhoto"
      :key="person.id"
      :to="`/person/${person.id}`"
      class="person-card"
    >
      <img :src="getImageUrl(person.profile_path!, 'profile', 'w185')" :alt="person.name" />
      <div class="name">{{ person.name }}</div>
      <div class="character" v-if="person.character || person.job">
        {{ person.character ? `as ${person.character}` : person.job }}
      </div>
    </router-link>
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
</script>

<style scoped>
.people-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.person-card {
  width: 130px;
  text-align: center;
  color: white;
  text-decoration: none;
  transition: transform 0.2s;
}

.person-card:hover {
  transform: scale(1.05);
}

.person-card img {
  width: 130px;
  height: 190px;
  border-radius: 10px;
  object-fit: cover;
}

.name {
  font-weight: bold;
  margin-top: 8px;
}

.character {
  font-size: 0.9rem;
  color: #ccc;
}
</style>
