<template>
  <IBackground>
    <div class="person-page" v-if="person">
      <div class="person-header">
        <img
          v-if="person.profile_path"
          :src="getImageUrl(person.profile_path, 'profile', 'h632')"
          alt="Person photo"
          class="person-photo"
        />
        <div class="person-info">
          <h1>{{ person.name }}</h1>
          <p v-if="person.birthday"><strong>Дата народження:</strong> {{ person.birthday }}</p>
          <p v-if="person.place_of_birth">
            <strong>Місце народження:</strong> {{ person.place_of_birth }}
          </p>
          <p v-if="person.biography"><strong>Біографія:</strong> {{ person.biography }}</p>
        </div>
      </div>

      <div class="person-credits" v-if="credits.length">
        <h2>Фільми та серіали</h2>
        <MediaList :items="credits" />
      </div>
    </div>

    <div v-else>Loading...</div>
  </IBackground>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPersonById, getPersonCombinedCredits } from '@/api/tmdb'
import { useLanguageStore } from '@/stores/language.'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import { getImageUrl } from '@/utils/getImageUrl'

// Інтерфейси
interface Person {
  id: number
  name: string
  profile_path?: string
  birthday?: string
  place_of_birth?: string
  biography?: string
}

interface Credit {
  id: number
  title?: string
  name?: string
  poster_path?: string
  media_type: 'movie' | 'tv'
}

interface CreditResponse {
  id: number
  title?: string
  name?: string
  poster_path?: string
  media_type: 'movie' | 'tv'
}

interface CreditsData {
  cast: CreditResponse[]
  crew: CreditResponse[]
}

const route = useRoute()
const languageStore = useLanguageStore()

const person = ref<Person | null>(null)
const credits = ref<Credit[]>([])

const fetchPersonData = async () => {
  const id = route.params.id as string
  person.value = await getPersonById(id)
  const creditsData: CreditsData = await getPersonCombinedCredits(id)
  credits.value = creditsData.cast.map((c: CreditResponse) => ({
    id: c.id,
    title: c.title,
    name: c.name,
    poster_path: c.poster_path,
    media_type: c.media_type,
  }))
}

onMounted(fetchPersonData)

// Автоматичне оновлення при зміні мови
watch(
  () => languageStore.lang,
  () => {
    fetchPersonData()
  },
)
</script>

<style scoped>
.person-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.person-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.person-photo {
  width: 250px;
  border-radius: 12px;
}

.person-info {
  flex: 1;
}

.person-credits h2 {
  margin-bottom: 15px;
}
</style>
