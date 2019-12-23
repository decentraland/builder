import { PaginationOptions, injectPagination, injectParams } from './utils'

export const locations = {
  root: (options: PaginationOptions = {}) => injectPagination('/', options),
  editor: (projectId = ':projectId') => `/editor/${projectId}`,
  poolSearch: (options: PaginationOptions = {}) => injectParams(injectPagination('/pools', options), { group: 'group', userId: 'user_id' }, options),
  poolView: (projectId = ':projectId', type = ':type(pool)') => `/view/${type}/${projectId}`,
  sceneView: (projectId = ':projectId') => `/view/${projectId}`,
  signIn: () => '/sign-in',
  mobile: () => '/mobile',
  notFound: () => '/404',
  callback: () => '/callback'
}
