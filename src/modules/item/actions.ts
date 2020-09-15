import { action } from 'typesafe-actions'
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
