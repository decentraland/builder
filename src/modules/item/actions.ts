import { action } from 'typesafe-actions'
import { ChainId } from '@dcl/schemas'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Collection } from 'modules/collection/types'
import { Item, Rarity } from './types'

// Fetch items

export const FETCH_ITEMS_REQUEST = '[Request] Fetch Items'
export const FETCH_ITEMS_SUCCESS = '[Success] Fetch Items'
export const FETCH_ITEMS_FAILURE = '[Failure] Fetch Items'

export const fetchItemsRequest = (address?: string) => action(FETCH_ITEMS_REQUEST, { address })
export const fetchItemsSuccess = (items: Item[]) => action(FETCH_ITEMS_SUCCESS, { items })
export const fetchItemsFailure = (error: string) => action(FETCH_ITEMS_FAILURE, { error })

export type FetchItemsRequestAction = ReturnType<typeof fetchItemsRequest>
export type FetchItemsSuccessAction = ReturnType<typeof fetchItemsSuccess>
export type FetchItemsFailureAction = ReturnType<typeof fetchItemsFailure>

// Fetch item

export const FETCH_ITEM_REQUEST = '[Request] Fetch Item'
export const FETCH_ITEM_SUCCESS = '[Success] Fetch Item'
export const FETCH_ITEM_FAILURE = '[Failure] Fetch Item'

export const fetchItemRequest = (id: string) => action(FETCH_ITEM_REQUEST, { id })
export const fetchItemSuccess = (id: string, item: Item) => action(FETCH_ITEM_SUCCESS, { id, item })
export const fetchItemFailure = (id: string, error: string) => action(FETCH_ITEM_FAILURE, { id, error })

export type FetchItemRequestAction = ReturnType<typeof fetchItemRequest>
export type FetchItemSuccessAction = ReturnType<typeof fetchItemSuccess>
export type FetchItemFailureAction = ReturnType<typeof fetchItemFailure>

// Fetch collection item

export const FETCH_COLLECTION_ITEMS_REQUEST = '[Request] Fetch Collection Items'
export const FETCH_COLLECTION_ITEMS_SUCCESS = '[Success] Fetch Collection Items'
export const FETCH_COLLECTION_ITEMS_FAILURE = '[Failure] Fetch Collection Items'

export const fetchCollectionItemsRequest = (collectionId: string) => action(FETCH_COLLECTION_ITEMS_REQUEST, { collectionId })
export const fetchCollectionItemsSuccess = (collectionId: string, items: Item[]) =>
  action(FETCH_COLLECTION_ITEMS_SUCCESS, { collectionId, items })
export const fetchCollectionItemsFailure = (collectionId: string, error: string) =>
  action(FETCH_COLLECTION_ITEMS_FAILURE, { collectionId, error })

export type FetchCollectionItemsRequestAction = ReturnType<typeof fetchCollectionItemsRequest>
export type FetchCollectionItemsSuccessAction = ReturnType<typeof fetchCollectionItemsSuccess>
export type FetchCollectionItemsFailureAction = ReturnType<typeof fetchCollectionItemsFailure>

// Save items

export const SAVE_ITEM_REQUEST = '[Request] Save Item'
export const SAVE_ITEM_SUCCESS = '[Success] Save Item'
export const SAVE_ITEM_FAILURE = '[Failure] Save Item'

export const saveItemRequest = (item: Item, contents: Record<string, Blob>) => action(SAVE_ITEM_REQUEST, { item, contents })
export const saveItemSuccess = (item: Item, contents: Record<string, Blob>) => action(SAVE_ITEM_SUCCESS, { item, contents })
export const saveItemFailure = (item: Item, contents: Record<string, Blob>, error: string) =>
  action(SAVE_ITEM_FAILURE, { item, contents, error })

export type SaveItemRequestAction = ReturnType<typeof saveItemRequest>
export type SaveItemSuccessAction = ReturnType<typeof saveItemSuccess>
export type SaveItemFailureAction = ReturnType<typeof saveItemFailure>

// Edit On Chain Sale Data

export const SAVE_PUBLISHED_ITEM_REQUEST = '[Request] Save published Item'
export const SAVE_PUBLISHED_ITEM_SUCCESS = '[Success] Save published Item'
export const SAVE_PUBLISHED_ITEM_FAILURE = '[Failure] Save published Item'

export const savePublishedItemRequest = (item: Item, contents: Record<string, Blob>) =>
  action(SAVE_PUBLISHED_ITEM_REQUEST, { item, contents })
export const savePublishedItemSuccess = (item: Item, chainId: ChainId, txHash?: string) => {
  const payload = txHash ? buildTransactionPayload(chainId, txHash, { item }) : {}
  return action(SAVE_PUBLISHED_ITEM_SUCCESS, { item, ...payload })
}
export const savePublishedItemFailure = (item: Item, contents: Record<string, Blob>, error: string) =>
  action(SAVE_PUBLISHED_ITEM_FAILURE, { item, contents, error })

export type SavePublishedItemRequestAction = ReturnType<typeof savePublishedItemRequest>
export type SavePublishedItemSuccessAction = ReturnType<typeof savePublishedItemSuccess>
export type SavePublishedItemFailureAction = ReturnType<typeof savePublishedItemFailure>

// Delete items

export const DELETE_ITEM_REQUEST = '[Request] Delete Item'
export const DELETE_ITEM_SUCCESS = '[Success] Delete Item'
export const DELETE_ITEM_FAILURE = '[Failure] Delete Item'

export const deleteItemRequest = (item: Item) => action(DELETE_ITEM_REQUEST, { item })
export const deleteItemSuccess = (item: Item) => action(DELETE_ITEM_SUCCESS, { item })
export const deleteItemFailure = (item: Item, error: string) => action(DELETE_ITEM_FAILURE, { item, error })

export type DeleteItemRequestAction = ReturnType<typeof deleteItemRequest>
export type DeleteItemSuccessAction = ReturnType<typeof deleteItemSuccess>
export type DeleteItemFailureAction = ReturnType<typeof deleteItemFailure>

// Set Collection

export const SET_COLLECTION = 'Set Collection'
export const setCollection = (item: Item, collectionId: string | null) => action(SET_COLLECTION, { item, collectionId })
export type SetCollectionAction = ReturnType<typeof setCollection>

// Set Token Ids

export const SET_ITEMS_TOKEN_ID_REQUEST = '[Request] Set Items Token Id'
export const SET_ITEMS_TOKEN_ID_SUCCESS = '[Success] Set Items Token Id'
export const SET_ITEMS_TOKEN_ID_FAILURE = '[Failure] Set Items Token Id'

export const setItemsTokenIdRequest = (collection: Collection, items: Item[]) => action(SET_ITEMS_TOKEN_ID_REQUEST, { collection, items })
export const setItemsTokenIdSuccess = (items: Item[]) => action(SET_ITEMS_TOKEN_ID_SUCCESS, { items })
export const setItemsTokenIdFailure = (collection: Collection, items: Item[], error: string) =>
  action(SET_ITEMS_TOKEN_ID_FAILURE, { collection, items, error })

export type SetItemsTokenIdRequestAction = ReturnType<typeof setItemsTokenIdRequest>
export type SetItemsTokenIdSuccessAction = ReturnType<typeof setItemsTokenIdSuccess>
export type SetItemsTokenIdFailureAction = ReturnType<typeof setItemsTokenIdFailure>

// Fetch rarities

export const FETCH_RARITIES_REQUEST = '[Request] Fetch Rarities'
export const FETCH_RARITIES_SUCCESS = '[Success] Fetch Rarities'
export const FETCH_RARITIES_FAILURE = '[Failure] Fetch Rarities'

export const fetchRaritiesRequest = () => action(FETCH_RARITIES_REQUEST)
export const fetchRaritiesSuccess = (rarities: Rarity[]) => action(FETCH_RARITIES_SUCCESS, { rarities })
export const fetchRaritiesFailure = (error: string) => action(FETCH_RARITIES_FAILURE, { error })

export type FetchRaritiesRequestAction = ReturnType<typeof fetchRaritiesRequest>
export type FetchRaritiesSuccessAction = ReturnType<typeof fetchRaritiesSuccess>
export type FetchRaritiesFailureAction = ReturnType<typeof fetchRaritiesFailure>

// Rescue items

export const RESCUE_ITEMS_REQUEST = '[Request] Rescue items'
export const RESCUE_ITEMS_SUCCESS = '[Success] Rescue items'
export const RESCUE_ITEMS_FAILURE = '[Failure] Rescue items'

export const rescueItemsRequest = (collection: Collection, items: Item[], contentHashes: string[]) =>
  action(RESCUE_ITEMS_REQUEST, { collection, items, contentHashes })
export const rescueItemsSuccess = (collection: Collection, items: Item[], contentHashes: string[], chainId: ChainId, txHash: string) =>
  action(RESCUE_ITEMS_SUCCESS, {
    collection,
    items,
    contentHashes,
    txHash,
    ...buildTransactionPayload(chainId, txHash, {
      count: items.length,
      collectionId: items[0].collectionId!,
      collectionName: collection.name
    })
  })
export const rescueItemsFailure = (collection: Collection, items: Item[], contentHashes: string[], error: string) =>
  action(RESCUE_ITEMS_FAILURE, { collection, items, contentHashes, error })

export type RescueItemsRequestAction = ReturnType<typeof rescueItemsRequest>
export type RescueItemsSuccessAction = ReturnType<typeof rescueItemsSuccess>
export type RescueItemsFailureAction = ReturnType<typeof rescueItemsFailure>
