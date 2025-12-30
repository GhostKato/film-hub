export interface TmdbItemType {
  id: number
  title?: string
  name?: string
  poster_path?: string
  media_type: 'movie' | 'tv' | 'person'
  first_air_date?: string
  release_date?: string
  vote_average?: number
  genre_ids?: number[]
}

export interface TmdbGenreType {
  id: number
  name: string
}
export interface TmdbProductionCountryType {
  name: string
}

export interface ProductionCompanyType {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}
export interface TmdbMediaType {
  id: number
  title?: string
  name?: string
  overview?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  tagline?: string
  genres?: TmdbGenreType[]
  production_countries?: TmdbProductionCountryType[]
  production_companies?: ProductionCompanyType[]
  runtime?: number
  episode_run_time?: number[]
}

export interface FirebaseItemType {
  id: number
  title?: string
  name?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type: 'movie' | 'tv' | 'person'
  favorite?: boolean
  watch_later?: boolean
  genre_ids?: number[]
  release_hidden?: boolean
  release?: boolean
}

export interface TrailerType {
  id: string
  key: string
  name: string
  site: string
  type: string
  iso_639_1: string
}

export interface MediaInfoType {
  release_date?: string
  first_air_date?: string
  vote_average?: number
}
