import { config } from 'config'
import { CollectionType } from 'modules/collection/types'
import { PaginationOptions, injectPagination, injectParams, CollectionDetailOptions } from './utils'

type ItemEditorParams = { itemId?: string; collectionId?: string; isReviewing?: string; newItem?: string }

export const locations = {
  root: () => '/',
  scenes: (options: PaginationOptions = {}) => injectPagination('/scenes', options),
  sceneEditor: (projectId = ':projectId') => `/scene-editor/${projectId}`,
  inspector: (projectId = ':projectId') => `/inspector/${projectId}`,
  poolSearch: (options?: PaginationOptions) =>
    injectParams(injectPagination('/pools', options), { group: 'group', ethAddress: 'eth_address' }, options),
  poolView: (projectId = ':projectId', type = ':type(pool)') => `/view/${type}/${projectId}`,
  sceneView: (projectId = ':projectId') => `/view/${projectId}`,
  signIn: (redirectTo?: string) => {
    return `/sign-in${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`
  },
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
  landOperator: (landId = ':landId') => `/land/${landId}/operator`,
  activity: () => '/activity',
  settings: () => '/settings',
  sceneDetail: (projectId = ':projectId') => `/scenes/${projectId}`,
  collections: () => '/collections',
  itemDetail: (itemId = ':itemId') => `/items/${itemId}`,
  collectionDetail: (collectionId = ':collectionId', type: CollectionType = CollectionType.STANDARD, options?: CollectionDetailOptions) => {
    switch (type) {
      case CollectionType.STANDARD:
        return injectParams(`/collections/${collectionId}`, { tab: 'tab' }, options)
      case CollectionType.THIRD_PARTY:
        return injectParams(locations.thirdPartyCollectionDetail(collectionId), { tab: 'tab' }, options)
      default:
        throw new Error(`Invalid collection type ${type as unknown as string}`)
    }
  },
  thirdPartyCollectionDetail: (collectionId = ':collectionId', options?: PaginationOptions) =>
    injectPagination(`/thirdPartyCollections/${collectionId}`, options),
  itemEditor: (options?: ItemEditorParams) =>
    injectParams('/item-editor', { itemId: 'item', collectionId: 'collection', isReviewing: 'reviewing', newItem: 'newItem' }, options),
  ens: () => '/names',
  ensDetail: (name = ':name') => `/names/${name}`,
  worlds: () => '/worlds',
  curation: () => '/curation',
  templates: () => '/templates',
  templateDetail: (templateId = ':templateId') => `/templates/${templateId}`
}

export function redirectToAuthDapp(customRedirect?: string) {
  window.location.replace(
    `${config.get('AUTH_URL')}/login?redirectTo=${encodeURIComponent(customRedirect ? customRedirect : window.location.href)}`
  )
}
