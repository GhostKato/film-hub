import axios from 'axios'
import { useLanguageStore } from '@/stores/language.'

const BASE_URL = 'https://api.themoviedb.org/3'
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
})

api.interceptors.request.use((config) => {
  const languageStore = useLanguageStore()
  if (!config.params) config.params = {}
  config.params.language = languageStore.lang
  return config
})

export async function getTrendingAllDay(page = 1) {
  const { data } = await api.get('/trending/all/day', { params: { page } })
  return data
}

export async function getMediaById(id: number | string, type: 'movie' | 'tv') {
  const { data } = await api.get(`/${type}/${id}`)
  return data
}

export async function searchMulti(query: string, page = 1) {
  if (!query.trim()) return { results: [] }

  const { data } = await api.get('/search/multi', {
    params: {
      query,
      page,
      include_adult: false,
    },
  })
  return data
}

export async function getPopularMovies(page = 1) {
  const { data } = await api.get('/movie/popular', { params: { page } })
  return data
}

export async function getTopRatedMovies(page = 1) {
  const { data } = await api.get('/movie/top_rated', { params: { page } })
  return data
}

export async function getNowPlayingMovies(page = 1) {
  const { data } = await api.get('/movie/now_playing', { params: { page } })
  return data
}

export async function getUpcomingMovies(page = 1) {
  const { data } = await api.get('/movie/upcoming', { params: { page } })
  return data
}

export async function getPopularTV(page = 1) {
  const { data } = await api.get('/tv/popular', { params: { page } })
  return data
}

export async function getTopRatedTV(page = 1) {
  const { data } = await api.get('/tv/top_rated', { params: { page } })
  return data
}

export async function getOnTheAirTV(page = 1) {
  const { data } = await api.get('/tv/on_the_air', { params: { page } })
  return data
}

export async function getAiringTodayTV(page = 1) {
  const { data } = await api.get('/tv/airing_today', { params: { page } })
  return data
}
