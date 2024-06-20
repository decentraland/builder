import { locations } from 'routing/locations'
import { matchPath } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import { getCollection } from 'modules/collection/selectors'
import { getPaginatedCollectionItems } from 'modules/item/selectors'
import { getFirstWearableOrItem } from 'modules/item/utils'
import { isThirdPartyCollection } from 'modules/collection/utils'

export function matchAppRoute<T extends Record<string, string>>(path: string, route: string) {
  return matchPath<T>(path, { path: route, strict: true, exact: true })
}

function landIdMatchParams() {
  return matchAppRoute<{ landId: string }>(window.location.pathname, locations.landDetail())?.params
}

export const getLandId = () => {
  const result = landIdMatchParams()
  return result ? result.landId : null
}

function projectIdMatchParams() {
  return matchAppRoute<{ projectId: string }>(window.location.pathname, locations.sceneDetail())?.params
}

export const getProjectId = () => {
  const result = projectIdMatchParams()
  return result ? result.projectId : null
}

function templateIdMatchParams() {
  return matchAppRoute<{ templateId: string }>(window.location.pathname, locations.templateDetail())?.params
}

export const getTemplateId = () => {
  const result = templateIdMatchParams()
  return result ? result.templateId : null
}

function itemIdMatchParams() {
  return matchAppRoute<{ itemId: string }>(window.location.pathname, locations.itemDetail())?.params
}

export const getItemId = () => {
  const result = itemIdMatchParams()
  return result ? result.itemId : null
}

function collectionIdMatchParams() {
  return matchAppRoute<{ collectionId: string }>(window.location.pathname, locations.collectionDetail())?.params
}

function thirdPartyCollectionIdMatchParams() {
  return matchAppRoute<{ collectionId: string }>(window.location.pathname, locations.thirdPartyCollectionDetail())?.params
}

export const getCollectionId = () => {
  const result = collectionIdMatchParams() || thirdPartyCollectionIdMatchParams()
  return result ? result.collectionId : null
}

export const getSelectedItemId = (state: RootState) => {
  const selectedItemId = new URLSearchParams(window.location.search).get('item')
  if (selectedItemId) return selectedItemId

  const collectionId = getSelectedCollectionId()
  if (!collectionId) return null

  const collection = getCollection(state, collectionId)

  const isReviewingTPCollection = collection ? isThirdPartyCollection(collection) && isReviewing(state) : false
  const allItems = getPaginatedCollectionItems(state, collectionId)
  const items = isReviewingTPCollection ? allItems.filter(item => item.isPublished) : allItems
  return getFirstWearableOrItem(items)?.id ?? null
}
export const getSelectedCollectionId = (state: RootState) =>
  new URLSearchParams(getSearch(state)).get('collection') ?? new URLSearchParams(getSearch(state)).get('collectionId')
export const isReviewing = (state: RootState) => !!new URLSearchParams(getSearch(state)).get('reviewing')

function ensNameMatchParams() {
  return matchAppRoute<{ name: string }>(window.location.pathname, locations.ensDetail())?.params
}

export const getENSName = () => {
  const result = ensNameMatchParams()
  return result ? result.name : null
}
