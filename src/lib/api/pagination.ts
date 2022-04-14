export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 60

export const addPaginationParameters = (url: string, page?: number, limit?: number) => {
  const params = new URLSearchParams()

  params.set('page', page ? page.toString() : DEFAULT_PAGE.toString())
  params.set('limit', limit ? limit.toString() : DEFAULT_PAGE_SIZE.toString())

  return `${url}?${params.toString()}`
}

export const getArrayOfPagesFromTotal = (totalPages: number) => {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
}
