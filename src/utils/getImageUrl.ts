const BASE_URL = 'https://image.tmdb.org/t/p/'

export const IMAGE_SIZES: Record<string, string[]> = {
  poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  backdrop: ['w300', 'w780', 'w1280', 'original'],
  profile: ['w45', 'w185', 'h632', 'original'],
  logo: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'],
  still: ['w92', 'w185', 'w300', 'original'],
}

export function getImageUrl(
  path: string | undefined,
  type: keyof typeof IMAGE_SIZES = 'poster',
  size?: string,
) {
  if (!path) return ''
  const sizes = IMAGE_SIZES[type] || ['original']
  const selectedSize = size && sizes.includes(size) ? size : sizes[0]
  return `${BASE_URL}${selectedSize}${path}`
}
