export function sortCollectionArray<
  T extends {
    title?: string
    name?: string
    original_title?: string
    original_name?: string
    release_date?: string
    first_air_date?: string
  },
>(array: T[], type: 1 | 2 | 3 | 4 | 5 | 6): T[] {
  const newArr = [...array]

  const getTitle = (item: T) =>
    item.title || item.name || item.original_title || item.original_name || ''

  const getDate = (item: T) => item.release_date || item.first_air_date || ''

  const locales = ['uk', 'ru', 'en']

  switch (type) {
    case 1:
      return newArr.sort((a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime())

    case 2:
      return newArr.sort((a, b) => new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime())

    case 3:
      return newArr.reverse()

    case 4:
      return newArr

    case 5:
      return newArr.sort((a, b) => getTitle(a).localeCompare(getTitle(b), locales))

    case 6:
      return newArr.sort((a, b) => getTitle(b).localeCompare(getTitle(a), locales))

    default:
      return newArr
  }
}
