import axios from 'axios'
import { useLanguageStore } from '@/stores/language'
import { TMDB_TOKEN } from '@/constants/env'

const BASE_URL = 'https://api.themoviedb.org/3'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_TOKEN}`,
  },
})

// Adds the language option before each request to receive data in the user's language.
api.interceptors.request.use((config) => {
  const languageStore = useLanguageStore()
  if (!config.params) config.params = {}
  config.params.language = languageStore.lang
  return config
})

// Returns trending movies and series in a day.
export async function getTrendingAllDay(page = 1) {
  const { data } = await api.get('/trending/all/day', { params: { page } })
  return data
}
// Returns full movie or series data for its id.
export async function getMediaById(id: number | string, type: 'movie' | 'tv') {
  const { data } = await api.get(`/${type}/${id}`)
  return data
}
// Returns the actors (cast) and crew (crew) for the movie/series.
export async function getMediaCredits(id: number | string, type: 'movie' | 'tv') {
  const { data } = await api.get(`/${type}/${id}/credits`)
  return data
}
// Searches for movies, series, people by query line.
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
// Popular movies
export async function getPopularMovies(page = 1) {
  const { data } = await api.get('/movie/popular', { params: { page } })
  return data
}
// Highest rating
export async function getTopRatedMovies(page = 1) {
  const { data } = await api.get('/movie/top_rated', { params: { page } })
  return data
}
// In cinemas now
export async function getNowPlayingMovies(page = 1) {
  const { data } = await api.get('/movie/now_playing', { params: { page } })
  return data
}
// Upcoming premieres
export async function getUpcomingMovies(page = 1) {
  const { data } = await api.get('/movie/upcoming', { params: { page } })
  return data
}
// Popular series
export async function getPopularTV(page = 1) {
  const { data } = await api.get('/tv/popular', { params: { page } })
  return data
}
// highest rating
export async function getTopRatedTV(page = 1) {
  const { data } = await api.get('/tv/top_rated', { params: { page } })
  return data
}
// series currently being released
export async function getOnTheAirTV(page = 1) {
  const { data } = await api.get('/tv/on_the_air', { params: { page } })
  return data
}
// Series released today
export async function getAiringTodayTV(page = 1) {
  const { data } = await api.get('/tv/airing_today', { params: { page } })
  return data
}
// Data of a specific person (actor, director)
export async function getPersonById(id: number | string) {
  const { data } = await api.get(`/person/${id}`)
  return data
}
// All films/series where he/she acted or worked
export async function getPersonCombinedCredits(id: number | string) {
  const { data } = await api.get(`/person/${id}/combined_credits`)
  return data
}

export type MediaType = 'movie' | 'tv'
export interface Trailer {
  id: string
  key: string
  name: string
  site: string
  type: string
  iso_639_1: string
}

interface VideosResponse {
  results?: Trailer[]
}
// Returns the YouTube trailer for the movie/series.
export async function getMediaVideos(id: number | string, type: MediaType): Promise<string | null> {
  try {
    const languageStore = useLanguageStore()
    const lang = languageStore.lang

    const { data } = await api.get<VideosResponse>(`/${type}/${id}/videos`)
    const videos: Trailer[] = data.results ?? []

    const trailers = videos.filter((v) => v.site === 'YouTube' && v.type === 'Trailer')

    const langPriority =
      lang === 'uk' ? ['uk', 'ru', 'en'] : lang === 'ru' ? ['ru', 'uk', 'en'] : ['en', 'uk', 'ru']

    for (const l of langPriority) {
      const video = trailers.find((v) => v.iso_639_1 === l)
      if (video) return video.key
    }

    return null
  } catch (error) {
    console.error('Error downloading video:', error)
    return null
  }
}

export interface Review {
  id: string
  author: string
  content: string
  created_at: string
  url: string
}

interface ReviewsResponse {
  results?: Review[]
}
// Returns user reviews to a movie or series.
export async function getMediaReviews(id: number | string, type: MediaType): Promise<Review[]> {
  try {
    const { data } = await api.get<ReviewsResponse>(`/${type}/${id}/reviews`)
    return data.results ?? []
  } catch (error) {
    console.error('Error loading reviews:', error)
    return []
  }
}

interface FetchOptions {
  rating?: 'all' | 'low' | 'medium' | 'high'
  genre?: string
  year?: number | string
  page?: number
}

interface MovieParams {
  sort_by: string
  include_adult: boolean
  include_video: boolean
  page: number
  with_genres?: string
  primary_release_year?: number | string
  'vote_average.lte'?: number
  'vote_average.gte'?: number
}

interface TVParams {
  sort_by: string
  page: number
  with_genres?: string
  first_air_date_year?: number
  'vote_average.lte'?: number
  'vote_average.gte'?: number
}

const getVoteAverage = (rating?: 'all' | 'low' | 'medium' | 'high') => {
  switch (rating) {
    case 'low':
      return { 'vote_average.lte': 4 }
    case 'medium':
      return { 'vote_average.gte': 5, 'vote_average.lte': 7 }
    case 'high':
      return { 'vote_average.gte': 8 }
    default:
      return {}
  }
}

export const fetchMovies = async (options: FetchOptions) => {
  const { rating, genre, year, page = 1 } = options
  const voteFilter = getVoteAverage(rating)

  const params: MovieParams = {
    sort_by: 'popularity.desc',
    include_adult: false,
    include_video: false,
    page,
    with_genres: genre || undefined,
    primary_release_year: year || undefined,
    ...voteFilter,
  }

  const { data } = await api.get('/discover/movie', { params })
  return data
}

export const fetchTV = async (options: FetchOptions) => {
  const { rating, genre, year, page = 1 } = options
  const voteFilter = getVoteAverage(rating)

  const params: TVParams = {
    sort_by: 'popularity.desc',
    page,
    with_genres: genre || undefined,
    first_air_date_year: year ? Number(year) : undefined,
    ...voteFilter,
  }

  const { data } = await api.get('/discover/tv', { params })
  return data
}
