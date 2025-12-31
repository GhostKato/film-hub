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
import type { CreditType, PersonType } from '@/types/person'
import { notificationStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'

const loaderStore = useLoaderStore()
const { t } = useI18n()

interface CreditsData {
  cast: CreditType[]
  crew: CreditType[]
}

const route = useRoute()
const languageStore = useLanguageStore()

const person = ref<PersonType | null>(null)
const credits = ref<CreditType[]>([])

const fetchPersonData = async () => {
  try {
    loaderStore.showLoader()
    const id = route.params.id as string
    person.value = await getPersonById(id)
    const creditsData: CreditsData = await getPersonCombinedCredits(id)
    credits.value = creditsData.cast.map((c: CreditType) => ({
      id: c.id,
      title: c.title,
      name: c.name,
      poster_path: c.poster_path,
      media_type: c.media_type,
      vote_average: c.vote_average,
      release_date: c.release_date,
      first_air_date: c.first_air_date,
    }))
  } catch {
    notificationStore.error(t('notification_message.person_error'))
  } finally {
    loaderStore.hideLoader()
  }
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
