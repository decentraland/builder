import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { FetchItemsSuccessAction, FetchItemSuccessAction, FETCH_ITEMS_SUCCESS, FETCH_ITEM_SUCCESS } from 'modules/item/actions'
import {
  FetchCollectionsRequestAction,
  FetchCollectionsSuccessAction,
  FetchCollectionsFailureAction,
  FetchCollectionRequestAction,
  FetchCollectionSuccessAction,
  FetchCollectionFailureAction,
  SaveCollectionRequestAction,
  SaveCollectionSuccessAction,
  SaveCollectionFailureAction,
  DeleteCollectionRequestAction,
  DeleteCollectionSuccessAction,
  DeleteCollectionFailureAction,
  FETCH_COLLECTIONS_REQUEST,
  FETCH_COLLECTIONS_SUCCESS,
  FETCH_COLLECTIONS_FAILURE,
  FETCH_COLLECTION_REQUEST,
  FETCH_COLLECTION_SUCCESS,
  FETCH_COLLECTION_FAILURE,
  SAVE_COLLECTION_REQUEST,
  SAVE_COLLECTION_FAILURE,
  SAVE_COLLECTION_SUCCESS,
  DELETE_COLLECTION_REQUEST,
  DELETE_COLLECTION_FAILURE,
  DELETE_COLLECTION_SUCCESS,
  PUBLISH_COLLECTION_SUCCESS,
  SET_COLLECTION_MINTERS_SUCCESS,
  SET_COLLECTION_MANAGERS_SUCCESS
} from './actions'
import { toCollectionObject } from './utils'
import { Collection } from './types'

export type CollectionState = {
  data: Record<string, Collection>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: CollectionState = {
  data: {},
  loading: [],
  error: null
}

type CollectionReducerAction =
  | FetchCollectionsRequestAction
  | FetchCollectionsSuccessAction
  | FetchCollectionsFailureAction
  | FetchCollectionRequestAction
  | FetchCollectionSuccessAction
  | FetchCollectionFailureAction
  | SaveCollectionRequestAction
  | SaveCollectionSuccessAction
  | SaveCollectionFailureAction
  | DeleteCollectionRequestAction
  | DeleteCollectionSuccessAction
  | DeleteCollectionFailureAction
  | FetchTransactionSuccessAction
  | FetchItemsSuccessAction
  | FetchItemSuccessAction

export function collectionReducer(state: CollectionState = INITIAL_STATE, action: CollectionReducerAction) {
  switch (action.type) {
    case FETCH_COLLECTIONS_REQUEST:
    case FETCH_COLLECTION_REQUEST:
    case DELETE_COLLECTION_REQUEST:
    case SAVE_COLLECTION_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_COLLECTIONS_SUCCESS: {
      const { collections } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...toCollectionObject(collections)
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_ITEMS_SUCCESS: {
      const { collections } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...toCollectionObject(collections)
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_ITEM_SUCCESS: {
      const { collection } = action.payload
      return collection
        ? {
            ...state,
            data: {
              ...state.data,
              ...toCollectionObject([collection])
            },
            loading: loadingReducer(state.loading, action),
            error: null
          }
        : state
    }
    case FETCH_COLLECTION_SUCCESS:
    case SAVE_COLLECTION_SUCCESS: {
      const { collection } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          ...toCollectionObject([collection])
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case DELETE_COLLECTION_SUCCESS: {
      const { collection } = action.payload
      const newState = {
        data: {
          ...state.data
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
      delete newState.data[collection.id]
      return newState
    }
    case FETCH_COLLECTIONS_FAILURE:
    case FETCH_COLLECTION_FAILURE:
    case SAVE_COLLECTION_FAILURE:
    case DELETE_COLLECTION_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case FETCH_TRANSACTION_SUCCESS: {
      const transaction = action.payload.transaction

      switch (transaction.actionType) {
        case PUBLISH_COLLECTION_SUCCESS: {
          const { collection } = transaction.payload
          return {
            ...state,
            data: {
              [collection.id]: {
                ...state.data[collection.id],
                isPublished: true
              }
            }
          }
        }
        case SET_COLLECTION_MINTERS_SUCCESS: {
          const { collection, minters } = transaction.payload
          return {
            ...state,
            data: {
              [collection.id]: {
                ...state.data[collection.id],
                minters: [...minters]
              }
            }
          }
        }
        case SET_COLLECTION_MANAGERS_SUCCESS: {
          const { collection, managers } = transaction.payload
          return {
            ...state,
            data: {
              [collection.id]: {
                ...state.data[collection.id],
                managers: [...managers]
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
