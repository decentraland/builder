import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
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
  PublishCollectionRequestAction,
  PublishCollectionFailureAction,
  ApproveCollectionRequestAction,
  ApproveCollectionFailureAction,
  RejectCollectionRequestAction,
  RejectCollectionFailureAction,
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
  PUBLISH_COLLECTION_REQUEST,
  PUBLISH_COLLECTION_FAILURE,
  PUBLISH_COLLECTION_SUCCESS,
  APPROVE_COLLECTION_REQUEST,
  APPROVE_COLLECTION_FAILURE,
  APPROVE_COLLECTION_SUCCESS,
  REJECT_COLLECTION_REQUEST,
  REJECT_COLLECTION_FAILURE,
  REJECT_COLLECTION_SUCCESS,
  SET_COLLECTION_MINTERS_SUCCESS,
  SET_COLLECTION_MANAGERS_SUCCESS,
  MINT_COLLECTION_ITEMS_SUCCESS,
  MINT_COLLECTION_ITEMS_REQUEST,
  MINT_COLLECTION_ITEMS_FAILURE,
  MintCollectionItemsFailureAction,
  MintCollectionItemsRequestAction,
  MintCollectionItemsSuccessAction
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
  | PublishCollectionRequestAction
  | PublishCollectionFailureAction
  | ApproveCollectionRequestAction
  | ApproveCollectionFailureAction
  | RejectCollectionRequestAction
  | RejectCollectionFailureAction
  | FetchTransactionSuccessAction
  | MintCollectionItemsRequestAction
  | MintCollectionItemsSuccessAction
  | MintCollectionItemsFailureAction

export function collectionReducer(state: CollectionState = INITIAL_STATE, action: CollectionReducerAction) {
  switch (action.type) {
    case FETCH_COLLECTIONS_REQUEST:
    case FETCH_COLLECTION_REQUEST:
    case SAVE_COLLECTION_REQUEST:
    case DELETE_COLLECTION_REQUEST:
    case PUBLISH_COLLECTION_REQUEST:
    case APPROVE_COLLECTION_REQUEST:
    case REJECT_COLLECTION_REQUEST:
    case MINT_COLLECTION_ITEMS_REQUEST:
    case MINT_COLLECTION_ITEMS_SUCCESS: {
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
    case DELETE_COLLECTION_FAILURE:
    case PUBLISH_COLLECTION_FAILURE:
    case APPROVE_COLLECTION_FAILURE:
    case REJECT_COLLECTION_FAILURE:
    case MINT_COLLECTION_ITEMS_FAILURE: {
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
            loading: loadingReducer(state.loading, action),
            data: {
              ...state.data,
              [collection.id]: {
                ...state.data[collection.id],
                isPublished: true
              }
            }
          }
        }
        case APPROVE_COLLECTION_SUCCESS: {
          const { collection } = transaction.payload
          return {
            ...state,
            loading: loadingReducer(state.loading, { type: transaction.actionType }),
            data: {
              ...state.data,
              [collection.id]: {
                ...state.data[collection.id],
                isApproved: true
              }
            }
          }
        }
        case REJECT_COLLECTION_SUCCESS: {
          const { collection } = transaction.payload
          return {
            ...state,
            loading: loadingReducer(state.loading, { type: transaction.actionType }),
            data: {
              ...state.data,
              [collection.id]: {
                ...state.data[collection.id],
                isApproved: false
              }
            }
          }
        }
        case SET_COLLECTION_MINTERS_SUCCESS: {
          const { collection, minters } = transaction.payload
          return {
            ...state,
            data: {
              ...state.data,
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
              ...state.data,
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
