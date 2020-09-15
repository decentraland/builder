import { Collection } from './types'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'

import {
  FetchCollectionsRequestAction,
  FetchCollectionsSuccessAction,
  FetchCollectionsFailureAction,
  SaveCollectionRequestAction,
  SaveCollectionSuccessAction,
  SaveCollectionFailureAction,
  DeleteCollectionRequestAction,
  DeleteCollectionSuccessAction,
  DeleteCollectionFailureAction,
  FETCH_COLLECTIONS_REQUEST,
  FETCH_COLLECTIONS_SUCCESS,
  FETCH_COLLECTIONS_FAILURE,
  SAVE_COLLECTION_REQUEST,
  SAVE_COLLECTION_FAILURE,
  SAVE_COLLECTION_SUCCESS,
  DELETE_COLLECTION_REQUEST,
  DELETE_COLLECTION_FAILURE,
  DELETE_COLLECTION_SUCCESS,
  PUBLISH_COLLECTION_SUCCESS
} from './actions'

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
  | SaveCollectionRequestAction
  | SaveCollectionSuccessAction
  | SaveCollectionFailureAction
  | DeleteCollectionRequestAction
  | DeleteCollectionSuccessAction
  | DeleteCollectionFailureAction
  | FetchTransactionSuccessAction

export function collectionReducer(state: CollectionState = INITIAL_STATE, action: CollectionReducerAction) {
  switch (action.type) {
    case FETCH_COLLECTIONS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_COLLECTIONS_SUCCESS: {
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload.collections.reduce((obj, Collection) => {
            obj[Collection.id] = Collection
            return obj
          }, {} as Record<string, Collection>)
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_COLLECTIONS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case SAVE_COLLECTION_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case SAVE_COLLECTION_SUCCESS: {
      const { collection } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [collection.id]: collection
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case SAVE_COLLECTION_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case DELETE_COLLECTION_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
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
        default:
          return state
      }
    }
    default:
      return state
  }
}
