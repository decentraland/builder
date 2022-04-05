export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20

export type PaginatedResource<T> = {
  results: T[]
  total: number
  limit: number
  page: number
  pages: number
}

export const getArrayOfPagesFromTotal = (totalPages: number) => {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
}
