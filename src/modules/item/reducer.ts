import { LocationChangeAction, LOCATION_CHANGE } from 'connected-react-router'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { Mint } from 'modules/collection/types'
import {
  PUBLISH_COLLECTION_SUCCESS,
  MINT_COLLECTION_ITEMS_SUCCESS,
  APPROVE_COLLECTION_SUCCESS,
  REJECT_COLLECTION_SUCCESS
} from 'modules/collection/actions'
import {
  FetchItemsRequestAction,
  FetchItemsSuccessAction,
  FetchItemsFailureAction,
  FETCH_ITEMS_REQUEST,
  FETCH_ITEMS_SUCCESS,
  FETCH_ITEMS_FAILURE,
  FetchItemRequestAction,
  FetchItemSuccessAction,
  FetchItemFailureAction,
  FETCH_ITEM_REQUEST,
  FETCH_ITEM_SUCCESS,
  FETCH_ITEM_FAILURE,
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
  SET_ITEMS_TOKEN_ID_FAILURE,
  FetchCollectionItemsRequestAction,
  FetchCollectionItemsSuccessAction,
  FetchCollectionItemsFailureAction,
  FETCH_COLLECTION_ITEMS_SUCCESS,
  FETCH_COLLECTION_ITEMS_REQUEST,
  FETCH_COLLECTION_ITEMS_FAILURE,
  FETCH_RARITIES_REQUEST,
  FetchRaritiesRequestAction,
  FETCH_RARITIES_SUCCESS,
  FetchRaritiesSuccessAction,
  FetchRaritiesFailureAction,
  FETCH_RARITIES_FAILURE,
  RESCUE_ITEMS_REQUEST,
  RescueItemsRequestAction,
  RescueItemsFailureAction,
  RescueItemsSuccessAction,
  RESCUE_ITEMS_FAILURE,
  RESCUE_ITEMS_SUCCESS,
  RESET_ITEM_REQUEST,
  RESET_ITEM_SUCCESS,
  RESET_ITEM_FAILURE,
  ResetItemRequestAction,
  ResetItemSuccessAction,
  ResetItemFailureAction
} from './actions'
import { toItemObject } from './utils'
import { Item, Rarity } from './types'

export type ItemState = {
  data: Record<string, Item>
  rarities: Rarity[]
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: ItemState = {
  data: {},
  rarities: [],
  loading: [],
  error: null
}

type ItemReducerAction =
  | LocationChangeAction
  | FetchItemsRequestAction
  | FetchItemsSuccessAction
  | FetchItemsFailureAction
  | FetchItemRequestAction
  | FetchItemSuccessAction
  | FetchItemFailureAction
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
  | FetchCollectionItemsRequestAction
  | FetchCollectionItemsSuccessAction
  | FetchCollectionItemsFailureAction
  | FetchRaritiesRequestAction
  | FetchRaritiesSuccessAction
  | FetchRaritiesFailureAction
  | RescueItemsRequestAction
  | RescueItemsSuccessAction
  | RescueItemsFailureAction
  | ResetItemRequestAction
  | ResetItemSuccessAction
  | ResetItemFailureAction

export function itemReducer(state: ItemState = INITIAL_STATE, action: ItemReducerAction): ItemState {
  switch (action.type) {
    case LOCATION_CHANGE: {
      return {
        ...state,
        error: null
      }
    }
    case FETCH_ITEMS_REQUEST:
    case FETCH_RARITIES_REQUEST:
    case FETCH_ITEM_REQUEST:
    case FETCH_COLLECTION_ITEMS_REQUEST:
    case SET_ITEMS_TOKEN_ID_REQUEST:
    case SAVE_PUBLISHED_ITEM_REQUEST:
    case SAVE_ITEM_REQUEST:
    case DELETE_ITEM_REQUEST:
    case RESET_ITEM_REQUEST:
    case RESCUE_ITEMS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_COLLECTION_ITEMS_SUCCESS:
    case FETCH_ITEMS_SUCCESS:
    case SET_ITEMS_TOKEN_ID_SUCCESS:
    case RESCUE_ITEMS_SUCCESS: {
      const { items } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...toItemObject(items)
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_RARITIES_SUCCESS: {
      const { rarities } = action.payload
      return {
        ...state,
        rarities,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_ITEMS_FAILURE:
    case FETCH_ITEM_FAILURE:
    case FETCH_COLLECTION_ITEMS_FAILURE:
    case SET_ITEMS_TOKEN_ID_FAILURE:
    case SAVE_PUBLISHED_ITEM_FAILURE:
    case SAVE_ITEM_FAILURE:
    case FETCH_RARITIES_FAILURE:
    case DELETE_ITEM_FAILURE:
    case RESET_ITEM_FAILURE:
    case RESCUE_ITEMS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case FETCH_ITEM_SUCCESS:
    case SAVE_PUBLISHED_ITEM_SUCCESS:
    case SAVE_ITEM_SUCCESS: {
      const { item } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...toItemObject([item])
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case RESET_ITEM_SUCCESS: {
      return { ...state, loading: loadingReducer(state.loading, action), error: null }
    }
    case DELETE_ITEM_SUCCESS: {
      const { item } = action.payload
      const newState = {
        ...state,
        data: {
          ...state.data
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
      delete newState.data[item.id]
      return newState
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
        case APPROVE_COLLECTION_SUCCESS: {
          const { collection } = transaction.payload
          return {
            ...state,
            data: {
              ...state.data,
              ...Object.values(state.data).reduce((accum, item) => {
                if (item.collectionId === collection.id) {
                  accum[item.id] = { ...state.data[item.id], ...item, isApproved: true }
                } else {
                  accum[item.id] = item
                }
                return accum
              }, {} as ItemState['data'])
            }
          }
        }
        case REJECT_COLLECTION_SUCCESS: {
          const { collection } = transaction.payload
          return {
            ...state,
            data: {
              ...state.data,
              ...Object.values(state.data).reduce((accum, item) => {
                if (item.collectionId === collection.id) {
                  accum[item.id] = { ...state.data[item.id], ...item, isApproved: false }
                } else {
                  accum[item.id] = item
                }
                return accum
              }, {} as ItemState['data'])
            }
          }
        }
        case PUBLISH_COLLECTION_SUCCESS: {
          const items: Item[] = transaction.payload.items
          return {
            ...state,
            data: {
              ...state.data,
              ...items.reduce((accum, item) => {
                accum[item.id] = { ...state.data[item.id], ...item, isPublished: true }
                return accum
              }, {} as ItemState['data'])
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
                const totalSupply = (item.totalSupply || 0) + mint.amount
                accum[item.id] = { ...state.data[item.id], totalSupply }
                return accum
              }, {} as ItemState['data'])
            }
          }
        }
        case SAVE_PUBLISHED_ITEM_SUCCESS: {
          const item: Item = transaction.payload.item
          return {
            ...state,
            data: {
              ...state.data,
              [item.id]: {
                ...state.data[item.id],
                ...item
              }
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
