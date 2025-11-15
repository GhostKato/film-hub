export const truncateTitle = (title: string): string => {
  let limit = 40

  if (window.matchMedia('(min-width: 768px)').matches) limit = 34
  if (window.matchMedia('(min-width: 1024px)').matches) limit = 20

  return title.length > limit ? title.slice(0, limit) + '...' : title
}
