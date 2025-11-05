export const COLORS = {
  rating: {
    low: '#9f1b19',
    medium: '#9d8127',
    high: '#008000',
  },
  release: {
    past: '#008000',
    upcoming: '#9f1b19',
  },
}
export const getRatingColor = (rating: number): string => {
  if (rating <= 5) return COLORS.rating.low
  if (rating < 8) return COLORS.rating.medium
  return COLORS.rating.high
}

export const getReleaseColor = (releaseDate: string): string => {
  const today = new Date()
  const release = new Date(releaseDate)

  return release <= today ? COLORS.release.past : COLORS.release.upcoming
}
