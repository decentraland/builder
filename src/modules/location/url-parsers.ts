import { matchPath } from 'react-router-dom'
import { locations } from 'routing/locations'

export const getSelectedItemIdFromSearchParams = (search: string): string | null => {
  const params = new URLSearchParams(search)
  return params.get('item')
}

export const getSelectedCollectionIdFromSearchParams = (search: string): string | null => {
  const params = new URLSearchParams(search)
  return params.get('collection') ?? params.get('collectionId')
}

export const isReviewingFromSearchParams = (search: string): boolean => {
  const params = new URLSearchParams(search)
  return params.get('reviewing') === 'true'
}

export const getNewItemNameFromSearchParams = (search: string): string | null => {
  const params = new URLSearchParams(search)
  return params.get('newItem')
}

export const getLandIdFromPath = (url: string): string | null => {
  const result = matchPath<{ landId: string }>(url, { path: locations.landDetail() })
  return result ? result.params.landId : null
}

export const getProjectIdFromPath = (url: string): string | null => {
  const result = matchPath<{ projectId: string }>(url, { path: locations.sceneDetail() })
  return result ? result.params.projectId : null
}

export const getTemplateIdFromPath = (url: string): string | null => {
  const result = matchPath<{ templateId: string }>(url, { path: locations.templateDetail() })
  return result ? result.params.templateId : null
}

export const getCollectionIdFromPath = (url: string): string | null => {
  const result = matchPath<{ collectionId: string }>(url, { path: locations.collectionDetail() })
  return result ? result.params.collectionId : null
}

export const getThirdPartyCollectionIdFromPath = (url: string): string | null => {
  const result = matchPath<{ collectionId: string }>(url, { path: locations.thirdPartyCollectionDetail() })
  return result ? result.params.collectionId : null
}

export const getCollectionIdFromUrl = (url: string): string | null => {
  return getCollectionIdFromPath(url) || getThirdPartyCollectionIdFromPath(url)
}

export const getENSNameFromPath = (url: string): string | null => {
  const result = matchPath<{ name: string }>(url, { path: locations.ensDetail() })
  return result ? result.params.name : null
}

export const getItemIdFromPath = (url: string): string | null => {
  const result = matchPath<{ itemId: string }>(url, { path: locations.itemDetail() })
  return result ? result.params.itemId : null
}
