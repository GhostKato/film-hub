import axios from 'axios'

const BASE_URL = 'https://api.themoviedb.org/3'
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
})

export async function getTrendingAllDay(page = 1) {
  const { data } = await api.get('/trending/all/day', {
    params: { page },
  })
  return data
}

export async function getMediaById(id: number | string, type: 'movie' | 'tv') {
  const { data } = await api.get(`/${type}/${id}`)
  return data
}
