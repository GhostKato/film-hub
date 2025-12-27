export interface PersonType {
  id: number
  name: string
  profile_path?: string
  birthday?: string
  place_of_birth?: string
  biography?: string
}
export interface CreditType {
  id: number
  title?: string
  name?: string
  poster_path?: string
  media_type: 'movie' | 'tv'
  vote_average: number
  release_date?: string
  first_air_date?: string
}
export interface PersonItemType {
  id: number
  name: string
  profile_path?: string
  character?: string
  job?: string
}
