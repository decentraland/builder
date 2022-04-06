import { Collection } from 'modules/collection/types'
import { action } from 'typesafe-actions'
import { ItemCuration } from './types'

// Fetch Item Curations

export const FETCH_ITEM_CURATIONS_REQUEST = '[Request] Fetch Item Curations'
export const FETCH_ITEM_CURATIONS_SUCCESS = '[Success] Fetch Item Curations'
export const FETCH_ITEM_CURATIONS_FAILURE = '[Failure] Fetch Item Curations'

export const fetchItemCurationsRequest = (collectionId: Collection['id']) => action(FETCH_ITEM_CURATIONS_REQUEST, { collectionId })
export const fetchItemCurationsSuccess = (collectionId: Collection['id'], itemCurations: ItemCuration[]) =>
  action(FETCH_ITEM_CURATIONS_SUCCESS, { collectionId, itemCurations })
export const fetchItemCurationsFailure = (error: string) => action(FETCH_ITEM_CURATIONS_FAILURE, { error })

export type FetchItemCurationsRequestAction = ReturnType<typeof fetchItemCurationsRequest>
export type FetchItemCurationsSuccessAction = ReturnType<typeof fetchItemCurationsSuccess>
export type FetchItemCurationsFailureAction = ReturnType<typeof fetchItemCurationsFailure>
