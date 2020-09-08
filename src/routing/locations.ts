import { PaginationOptions, injectPagination, injectParams } from './utils'

export const locations = {
  root: (options: PaginationOptions = {}) => injectPagination('/', options),
  editor: (projectId = ':projectId') => `/editor/${projectId}`,
  poolSearch: (options: PaginationOptions = {}) =>
    injectParams(injectPagination('/pools', options), { group: 'group', ethAddress: 'eth_address' }, options),
  poolView: (projectId = ':projectId', type = ':type(pool)') => `/view/${type}/${projectId}`,
  sceneView: (projectId = ':projectId') => `/view/${projectId}`,
  signIn: () => '/sign-in',
  mobile: () => '/mobile',
  notFound: () => '/404',
  callback: () => '/callback',
  migrate: () => '/migrate',
  land: () => '/land',
  landDetail: (landId = ':landId') => `/land/${landId}`,
  landTransfer: (landId = ':landId') => `/land/${landId}/transfer`,
  landEdit: (landId = ':landId') => `/land/${landId}/edit`,
  landEns: (landId = ':landId') => `/land/${landId}/ens`,
  landOperator: (landId = ':landId') => `/land/${landId}/operator`,
  activity: () => `/activity`,
  settings: () => `/settings`,
  sceneDetail: (projectId = ':projectId') => `/scenes/${projectId}`
}
