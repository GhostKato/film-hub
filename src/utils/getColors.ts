export const COLORS = {
  rating: {
    low: '#9f1b19',
    medium: '#b47022ff',
    high: '#008000',
  },
  release: {
    past: '#008000',
    today: '#15489bff',
    upcoming: '#7E57C2',
  },
}
export const getRatingColor = (rating: number): string => {
  if (rating <= 5) return COLORS.rating.low
  if (rating < 8) return COLORS.rating.medium
  return COLORS.rating.high
}

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const getReleaseColor = (releaseDate: string): string => {
  const today = normalizeDate(new Date())
  const release = normalizeDate(new Date(releaseDate))

  if (release > today) return COLORS.release.upcoming
  if (release.getTime() === today.getTime()) return COLORS.release.today

  return COLORS.release.past
}
