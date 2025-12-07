export interface FiltersType {
  filterType: 'movie' | 'tv' | 'all'
  genre: string
  rating: 'all' | 'low' | 'medium' | 'high'
  year: string
  query?: string
  sortType?: '1' | '2' | '3' | '4' | '5' | '6'
}
