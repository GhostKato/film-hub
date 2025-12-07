export const getVoteAverage = (rating?: 'all' | 'low' | 'medium' | 'high') => {
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
