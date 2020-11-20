import { action } from 'typesafe-actions'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Collection } from 'modules/collection/types'
import { Item } from './types'

// Fetch items

export const FETCH_ITEMS_REQUEST = '[Request] Fetch Items'
export const FETCH_ITEMS_SUCCESS = '[Success] Fetch Items'
export const FETCH_ITEMS_FAILURE = '[Failure] Fetch Items'

export const fetchItemsRequest = () => action(FETCH_ITEMS_REQUEST)
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

export const savePublishedItemRequest = (item: Item) => action(SAVE_PUBLISHED_ITEM_REQUEST, { item })
export const savePublishedItemSuccess = (item: Item, txHash: string) =>
  action(SAVE_PUBLISHED_ITEM_SUCCESS, { item, ...buildTransactionPayload(txHash, { item }) })
export const savePublishedItemFailure = (item: Item, error: string) => action(SAVE_PUBLISHED_ITEM_FAILURE, { item, error })

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

export const setItemsTokenIdRequest = (items: Item[], tokenIds: string[]) => action(SET_ITEMS_TOKEN_ID_REQUEST, { items, tokenIds })
export const setItemsTokenIdSuccess = (items: Item[], tokenIds: string[]) => action(SET_ITEMS_TOKEN_ID_SUCCESS, { items, tokenIds })
export const setItemsTokenIdFailure = (items: Item[], error: string) => action(SET_ITEMS_TOKEN_ID_FAILURE, { items, error })

export type SetItemsTokenIdRequestAction = ReturnType<typeof setItemsTokenIdRequest>
export type SetItemsTokenIdSuccessAction = ReturnType<typeof setItemsTokenIdSuccess>
export type SetItemsTokenIdFailureAction = ReturnType<typeof setItemsTokenIdFailure>

// Deploy item contents

export const DEPLOY_ITEM_CONTENTS_REQUEST = '[Request] Deploy item contents'
export const DEPLOY_ITEM_CONTENTS_SUCCESS = '[Success] Deploy item contents'
export const DEPLOY_ITEM_CONTENTS_FAILURE = '[Failure] Deploy item contents'

export const deployItemContentsRequest = (collection: Collection, item: Item) => action(DEPLOY_ITEM_CONTENTS_REQUEST, { collection, item })
export const deployItemContentsSuccess = (collection: Collection, item: Item) => action(DEPLOY_ITEM_CONTENTS_SUCCESS, { collection, item })
export const deployItemContentsFailure = (collection: Collection, item: Item, error: string) =>
  action(DEPLOY_ITEM_CONTENTS_FAILURE, { collection, item, error })

export type DeployItemContentsRequestAction = ReturnType<typeof deployItemContentsRequest>
export type DeployItemContentsSuccessAction = ReturnType<typeof deployItemContentsSuccess>
export type DeployItemContentsFailureAction = ReturnType<typeof deployItemContentsFailure>
