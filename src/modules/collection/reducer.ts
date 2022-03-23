import { LocationChangeAction, LOCATION_CHANGE } from 'connected-react-router'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import {
  CreateCollectionForumPostRequestAction,
  CreateCollectionForumPostSuccessAction,
  CreateCollectionForumPostFailureAction,
  CREATE_COLLECTION_FORUM_POST_REQUEST,
  CREATE_COLLECTION_FORUM_POST_SUCCESS,
  CREATE_COLLECTION_FORUM_POST_FAILURE
} from 'modules/forum/actions'
import { PublishThirdPartyItemsSuccessAction, PUBLISH_THIRD_PARTY_ITEMS_SUCCESS } from 'modules/thirdParty/actions'
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
  PublishCollectionSuccessAction,
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
  SET_COLLECTION_MINTERS_REQUEST,
  SET_COLLECTION_MINTERS_SUCCESS,
  SET_COLLECTION_MINTERS_FAILURE,
  SetCollectionMintersRequestAction,
  SetCollectionMintersSuccessAction,
  SetCollectionMintersFailureAction,
  SET_COLLECTION_MANAGERS_REQUEST,
  SET_COLLECTION_MANAGERS_SUCCESS,
  SET_COLLECTION_MANAGERS_FAILURE,
  SetCollectionManagersRequestAction,
  SetCollectionManagersSuccessAction,
  SetCollectionManagersFailureAction,
  MINT_COLLECTION_ITEMS_REQUEST,
  MINT_COLLECTION_ITEMS_SUCCESS,
  MINT_COLLECTION_ITEMS_FAILURE,
  MintCollectionItemsRequestAction,
  MintCollectionItemsSuccessAction,
  MintCollectionItemsFailureAction,
  ApproveCollectionSuccessAction
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
  | LocationChangeAction
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
  | PublishCollectionSuccessAction
  | PublishCollectionFailureAction
  | ApproveCollectionRequestAction
  | ApproveCollectionSuccessAction
  | ApproveCollectionFailureAction
  | RejectCollectionRequestAction
  | RejectCollectionFailureAction
  | FetchTransactionSuccessAction
  | SetCollectionMintersRequestAction
  | SetCollectionMintersSuccessAction
  | SetCollectionMintersFailureAction
  | SetCollectionManagersRequestAction
  | SetCollectionManagersSuccessAction
  | SetCollectionManagersFailureAction
  | MintCollectionItemsRequestAction
  | MintCollectionItemsSuccessAction
  | MintCollectionItemsFailureAction
  | CreateCollectionForumPostRequestAction
  | CreateCollectionForumPostSuccessAction
  | CreateCollectionForumPostFailureAction
  | PublishThirdPartyItemsSuccessAction

export function collectionReducer(state: CollectionState = INITIAL_STATE, action: CollectionReducerAction) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      return {
        ...state,
        error: null
      }
    }
    case FETCH_COLLECTIONS_REQUEST:
    case FETCH_COLLECTION_REQUEST:
    case SAVE_COLLECTION_REQUEST:
    case DELETE_COLLECTION_REQUEST:
    case PUBLISH_COLLECTION_REQUEST:
    case APPROVE_COLLECTION_REQUEST:
    case REJECT_COLLECTION_REQUEST:
    case SET_COLLECTION_MINTERS_REQUEST:
    case SET_COLLECTION_MINTERS_SUCCESS:
    case SET_COLLECTION_MANAGERS_REQUEST:
    case SET_COLLECTION_MANAGERS_SUCCESS:
    case MINT_COLLECTION_ITEMS_REQUEST:
    case MINT_COLLECTION_ITEMS_SUCCESS:
    case CREATE_COLLECTION_FORUM_POST_REQUEST:
    case APPROVE_COLLECTION_SUCCESS: {
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
    case PUBLISH_COLLECTION_SUCCESS: {
      const { collection } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [collection.id]: {
            ...state.data[collection.id],
            lock: collection.lock
          }
        }
      }
    }
    case PUBLISH_THIRD_PARTY_ITEMS_SUCCESS: {
      const { collectionId } = action.payload
      const now = Date.now()

      return {
        ...state,
        data: {
          ...state.data,
          [collectionId]: {
            ...state.data[collectionId],
            isPublished: true,

            // Consolidation on the builder-server will populate these values with the ones on the database
            // which have the value set at the moment the publication occured.
            createdAt: now,
            updatedAt: now,
            reviewedAt: now
          }
        }
      }
    }
    case CREATE_COLLECTION_FORUM_POST_SUCCESS: {
      const { collection, forumLink } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [collection.id]: {
            ...state.data[collection.id],
            forumLink
          }
        }
      }
    }
    case FETCH_COLLECTIONS_FAILURE:
    case FETCH_COLLECTION_FAILURE:
    case SAVE_COLLECTION_FAILURE:
    case DELETE_COLLECTION_FAILURE:
    case PUBLISH_COLLECTION_FAILURE:
    case APPROVE_COLLECTION_FAILURE:
    case REJECT_COLLECTION_FAILURE:
    case SET_COLLECTION_MINTERS_FAILURE:
    case SET_COLLECTION_MANAGERS_FAILURE:
    case MINT_COLLECTION_ITEMS_FAILURE:
    case CREATE_COLLECTION_FORUM_POST_FAILURE: {
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
          const now = Date.now()

          return {
            ...state,
            loading: loadingReducer(state.loading, action),
            data: {
              ...state.data,
              [collection.id]: {
                ...state.data[collection.id],
                isPublished: true,
                // These date values are set to the current date because, as the collection is published,
                // consolidation on the builder-server will populate these values with the ones on the blockchain
                // which have the value set at the moment the publication occured.
                createdAt: now,
                updatedAt: now,
                reviewedAt: now
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
                reviewedAt: Date.now(),
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
                reviewedAt: Date.now(),
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
