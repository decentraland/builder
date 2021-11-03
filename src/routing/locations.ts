import { PaginationOptions, injectPagination, injectParams } from './utils'

type ItemEditorParams = { itemId?: string; collectionId?: string; isReviewing?: string }

export const locations = {
  root: (options: PaginationOptions = {}) => injectPagination('/', options),
  sceneEditor: (projectId = ':projectId') => `/scene-editor/${projectId}`,
  poolSearch: (options?: PaginationOptions) =>
    injectParams(injectPagination('/pools', options), { group: 'group', ethAddress: 'eth_address' }, options),
  poolView: (projectId = ':projectId', type = ':type(pool)') => `/view/${type}/${projectId}`,
  sceneView: (projectId = ':projectId') => `/view/${projectId}`,
  signIn: () => '/sign-in',
  mobile: () => '/mobile',
  notFound: () => '/404',
  callback: () => '/callback',
  land: () => '/land',
  landDetail: (landId = ':landId') => `/land/${landId}`,
  landTransfer: (landId = ':landId') => `/land/${landId}/transfer`,
  landEdit: (landId = ':landId') => `/land/${landId}/edit`,
  landSelectENS: (landId = ':landId') => `/land/${landId}/select-name`,
  landAssignENS: (landId = ':landId', subdomain = ':subdomain') => `/land/${landId}/name/${subdomain}/assign`,
  ensSelectLand: (subdomain = ':subdomain') => `/name/${subdomain}/set-land`,
  claimENS: () => '/claim-name',
  landOperator: (landId = ':landId') => `/land/${landId}/operator`,
  activity: () => `/activity`,
  settings: () => `/settings`,
  sceneDetail: (projectId = ':projectId') => `/scenes/${projectId}`,
  collections: () => '/collections',
  itemDetail: (itemId = ':itemId') => `/items/${itemId}`,
  collectionDetail: (collectionId = ':collectionId') => `/collections/${collectionId}`,
  thirdPartyCollectionDetail: (collectionId = ':collectionId') => `/thirdPartyCollection/${collectionId}`,
  itemEditor: (options?: ItemEditorParams) =>
    injectParams(`/item-editor`, { itemId: 'item', collectionId: 'collection', isReviewing: 'reviewing' }, options),
  ens: () => '/names',
  curation: () => '/curation'
}
