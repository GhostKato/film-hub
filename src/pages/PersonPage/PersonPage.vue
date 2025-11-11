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
          <p v-if="person.birthday">
            <strong>{{ $t('person_page.date_of_birth') }}</strong> {{ person.birthday }}
          </p>
          <p v-if="person.place_of_birth">
            <strong>{{ $t('person_page.place_of_birth') }}</strong> {{ person.place_of_birth }}
          </p>
          <p v-if="person.biography">
            <strong>{{ $t('person_page.biography') }}</strong> {{ person.biography }}
          </p>
        </div>
      </div>

      <div class="person-credits" v-if="credits.length">
        <h2>{{ $t('person_page.movies_series_title') }}</h2>
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
import { useLanguageStore } from '@/stores/language'
import IBackground from '@/components/IBackground/IBackground.vue'
import MediaList from '@/components/MediaList/MediaList.vue'
import { getImageUrl } from '@/utils/getImageUrl'
import { useLoaderStore } from '@/stores/loader'

const loader = useLoaderStore()

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
  loader.showLoader()
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
  loader.hideLoader()
}

onMounted(fetchPersonData)

watch(
  () => languageStore.lang,
  () => {
    fetchPersonData()
  },
)
</script>

<style scoped>
.person-page {
  padding: 10px;
}

.person-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
}

.person-photo {
  width: 250px;
  border-radius: 8px;
}

.person-info {
  flex: 1;
}

.person-credits h2 {
  margin-bottom: 15px;
}
@media (min-width: 768px) {
  .person-page {
    padding: 15px;
  }
  .person-header {
    display: flex;
    flex-direction: row;
  }
}
</style>
