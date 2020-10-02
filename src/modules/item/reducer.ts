import { Item } from './types'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'

import { Mint } from 'modules/collection/types'
import { PUBLISH_COLLECTION_SUCCESS, MINT_COLLECTION_ITEMS_SUCCESS } from 'modules/collection/actions'
import {
  FetchItemsRequestAction,
  FetchItemsSuccessAction,
  FetchItemsFailureAction,
  FETCH_ITEMS_REQUEST,
  FETCH_ITEMS_SUCCESS,
  FETCH_ITEMS_FAILURE,
  SaveItemRequestAction,
  SaveItemSuccessAction,
  SaveItemFailureAction,
  SAVE_ITEM_REQUEST,
  SAVE_ITEM_FAILURE,
  SAVE_ITEM_SUCCESS,
  SavePublishedItemRequestAction,
  SavePublishedItemSuccessAction,
  SavePublishedItemFailureAction,
  SAVE_PUBLISHED_ITEM_REQUEST,
  SAVE_PUBLISHED_ITEM_FAILURE,
  SAVE_PUBLISHED_ITEM_SUCCESS,
  DeleteItemRequestAction,
  DeleteItemSuccessAction,
  DeleteItemFailureAction,
  DELETE_ITEM_REQUEST,
  DELETE_ITEM_SUCCESS,
  DELETE_ITEM_FAILURE,
  SetCollectionAction,
  SET_COLLECTION,
  SetItemsTokenIdRequestAction,
  SetItemsTokenIdSuccessAction,
  SetItemsTokenIdFailureAction,
  SET_ITEMS_TOKEN_ID_REQUEST,
  SET_ITEMS_TOKEN_ID_SUCCESS,
  SET_ITEMS_TOKEN_ID_FAILURE
} from './actions'

export type ItemState = {
  data: Record<string, Item>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: ItemState = {
  data: {},
  loading: [],
  error: null
}

type ItemReducerAction =
  | FetchItemsRequestAction
  | FetchItemsSuccessAction
  | FetchItemsFailureAction
  | SaveItemRequestAction
  | SaveItemSuccessAction
  | SaveItemFailureAction
  | SavePublishedItemRequestAction
  | SavePublishedItemSuccessAction
  | SavePublishedItemFailureAction
  | DeleteItemRequestAction
  | DeleteItemSuccessAction
  | DeleteItemFailureAction
  | SetCollectionAction
  | FetchTransactionSuccessAction
  | SetItemsTokenIdRequestAction
  | SetItemsTokenIdSuccessAction
  | SetItemsTokenIdFailureAction

export function itemReducer(state: ItemState = INITIAL_STATE, action: ItemReducerAction) {
  switch (action.type) {
    case FETCH_ITEMS_REQUEST:
    case SET_ITEMS_TOKEN_ID_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_ITEMS_SUCCESS:
    case SET_ITEMS_TOKEN_ID_SUCCESS: {
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload.items.reduce((obj, item) => {
            obj[item.id] = item
            return obj
          }, {} as Record<string, Item>)
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_ITEMS_FAILURE:
    case SET_ITEMS_TOKEN_ID_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case SAVE_PUBLISHED_ITEM_REQUEST:
    case SAVE_ITEM_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case SAVE_PUBLISHED_ITEM_SUCCESS:
    case SAVE_ITEM_SUCCESS: {
      const { item } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [item.id]: item
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case SAVE_PUBLISHED_ITEM_FAILURE:
    case SAVE_ITEM_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case DELETE_ITEM_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case DELETE_ITEM_SUCCESS: {
      const { item } = action.payload
      const newState = {
        data: {
          ...state.data
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
      delete newState.data[item.id]
      return newState
    }
    case DELETE_ITEM_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case SET_COLLECTION: {
      const { item, collectionId } = action.payload
      const newItem: Item = { ...item }
      if (collectionId) {
        newItem.collectionId = collectionId
      } else {
        delete newItem.collectionId
      }
      return {
        ...state,
        data: {
          ...state.data,
          [newItem.id]: newItem
        }
      }
    }
    case FETCH_TRANSACTION_SUCCESS: {
      const transaction = action.payload.transaction

      switch (transaction.actionType) {
        case PUBLISH_COLLECTION_SUCCESS: {
          const items: Item[] = transaction.payload.items
          return {
            ...state,
            data: {
              ...state.data,
              ...items.reduce(
                (accum, item) => ({
                  ...accum,
                  [item.id]: { ...item, isPublished: true }
                }),
                {}
              )
            }
          }
        }
        case MINT_COLLECTION_ITEMS_SUCCESS: {
          const mints: Mint[] = transaction.payload.mints

          return {
            ...state,
            data: {
              ...state.data,
              ...mints.reduce((accum, mint) => {
                const item = state.data[mint.item.id]
                const totalSupply = (item.totalSupply || 0) + 1
                return {
                  ...accum,
                  [item.id]: { ...state.data[item.id], totalSupply }
                }
              }, {})
            }
          }
        }
        default:
          return state
      }
    }
    default:
      return state
  }
}
