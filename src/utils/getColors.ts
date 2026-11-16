export const COLORS = {
  rating: {
    low: 'var(--glass-red)',
    medium: 'var(--glass-orange)',
    high: 'var(--glass-green)',
  },
  release: {
    past: 'var(--glass-green)',
    today: 'var(--glass-blue)',
    upcoming: 'var(--glass-purple)',
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
