import { Collection } from './types'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchCollectionsRequestAction,
  FetchCollectionsSuccessAction,
  FetchCollectionsFailureAction,
  SaveCollectionRequestAction,
  SaveCollectionSuccessAction,
  SaveCollectionFailureAction,
  FETCH_COLLECTIONS_REQUEST,
  FETCH_COLLECTIONS_SUCCESS,
  FETCH_COLLECTIONS_FAILURE,
  SAVE_COLLECTION_REQUEST,
  SAVE_COLLECTION_FAILURE,
  SAVE_COLLECTION_SUCCESS
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
    default:
      return state
  }
}
