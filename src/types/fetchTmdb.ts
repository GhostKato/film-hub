export type MediaType = 'movie' | 'tv'
export interface FetchOptions {
  rating?: 'all' | 'low' | 'medium' | 'high'
  genre?: string
  year?: number | string
  page?: number
}
export interface MovieParams {
  sort_by: string
  include_adult: boolean
  include_video: boolean
  page: number
  with_genres?: string
  primary_release_year?: number | string
  'vote_average.lte'?: number
  'vote_average.gte'?: number
}
export interface TVParams {
  sort_by: string
  page: number
  with_genres?: string
  first_air_date_year?: number
  'vote_average.lte'?: number
  'vote_average.gte'?: number
}
