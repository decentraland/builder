import { SortBy } from 'modules/ui/dashboard/types'

export type PaginationOptions = { page?: number; sortBy?: SortBy }
export const locations = {
  root: (options: PaginationOptions = {}) => {
    let location = '/'
    let params = []
    if (options.page) {
      params.push(`page=${options.page}`)
    }
    if (options.sortBy) {
      params.push(`sort_by=${options.sortBy}`)
    }
    if (params.length > 0) {
      location += `?${params.join('&')}`
    }
    return location
  },
  editor: (projectId = ':projectId') => `/editor/${projectId}`,
  poolView: (projectId = ':projectId', type = ':type(pool)') => `/view/${type}/${projectId}`,
  sceneView: (projectId = ':projectId') => `/view/${projectId}`,
  signIn: () => '/sign-in',
  mobile: () => '/mobile',
  notFound: () => '/404',
  callback: () => '/callback'
}
