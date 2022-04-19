export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 60

export type PaginationStats = {
  total: number
  limit: number
  page: number
  pages: number
}

export type PaginatedResource<T> = {
  results: T[]
} & PaginationStats

export const getArrayOfPagesFromTotal = (totalPages: number) => {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
}
