import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { CurationStatus } from '../types'
import {
  ApproveCollectionCurationFailureAction,
  ApproveCollectionCurationRequestAction,
  ApproveCollectionCurationSuccessAction,
  APPROVE_COLLECTION_CURATION_FAILURE,
  APPROVE_COLLECTION_CURATION_REQUEST,
  APPROVE_COLLECTION_CURATION_SUCCESS,
  FetchCollectionCurationFailureAction,
  FetchCollectionCurationRequestAction,
  FetchCollectionCurationsFailureAction,
  FetchCollectionCurationsRequestAction,
  FetchCollectionCurationsSuccessAction,
  FetchCollectionCurationSuccessAction,
  FETCH_COLLECTION_CURATIONS_FAILURE,
  FETCH_COLLECTION_CURATIONS_REQUEST,
  FETCH_COLLECTION_CURATIONS_SUCCESS,
  FETCH_COLLECTION_CURATION_FAILURE,
  FETCH_COLLECTION_CURATION_REQUEST,
  FETCH_COLLECTION_CURATION_SUCCESS,
  PushCollectionCurationFailureAction,
  PushCollectionCurationRequestAction,
  PushCollectionCurationSuccessAction,
  PUSH_COLLECTION_CURATION_FAILURE,
  PUSH_COLLECTION_CURATION_REQUEST,
  PUSH_COLLECTION_CURATION_SUCCESS,
  RejectCollectionFailureSuccessAction,
  RejectCollectionCurationRequestAction,
  RejectCollectionCurationSuccessAction,
  REJECT_COLLECTION_CURATION_FAILURE,
  REJECT_COLLECTION_CURATION_REQUEST,
  REJECT_COLLECTION_CURATION_SUCCESS,
  SET_COLLECTION_CURATION_ASSIGNEE_SUCCESS,
  SetCollectionCurationAssigneeRequestAction,
  SetCollectionCurationAssigneeSuccessAction,
  SetCollectionCurationAssigneeFailureAction,
  SET_COLLECTION_CURATION_ASSIGNEE_REQUEST,
  SET_COLLECTION_CURATION_ASSIGNEE_FAILURE
} from './actions'
import { CollectionCuration } from './types'

export type CollectionCurationState = {
  data: Record<string, CollectionCuration>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: CollectionCurationState = {
  data: {},
  loading: [],
  error: null
}

type CurationReducerAction =
  | FetchCollectionCurationsRequestAction
  | FetchCollectionCurationsSuccessAction
  | FetchCollectionCurationsFailureAction
  | FetchCollectionCurationRequestAction
  | FetchCollectionCurationSuccessAction
  | FetchCollectionCurationFailureAction
  | PushCollectionCurationRequestAction
  | PushCollectionCurationSuccessAction
  | PushCollectionCurationFailureAction
  | ApproveCollectionCurationRequestAction
  | ApproveCollectionCurationSuccessAction
  | ApproveCollectionCurationFailureAction
  | RejectCollectionCurationRequestAction
  | RejectCollectionCurationSuccessAction
  | RejectCollectionFailureSuccessAction
  | SetCollectionCurationAssigneeRequestAction
  | SetCollectionCurationAssigneeSuccessAction
  | SetCollectionCurationAssigneeFailureAction

export function collectionCurationReducer(
  state: CollectionCurationState = INITIAL_STATE,
  action: CurationReducerAction
): CollectionCurationState {
  switch (action.type) {
    case FETCH_COLLECTION_CURATIONS_REQUEST:
    case FETCH_COLLECTION_CURATION_REQUEST:
    case PUSH_COLLECTION_CURATION_REQUEST:
    case APPROVE_COLLECTION_CURATION_REQUEST:
    case REJECT_COLLECTION_CURATION_REQUEST:
    case SET_COLLECTION_CURATION_ASSIGNEE_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }

    case FETCH_COLLECTION_CURATIONS_SUCCESS:
      const { curations } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: curations.reduce((acc, curation) => ({ ...acc, [curation.collectionId]: curation }), {}),
        error: null
      }

    case SET_COLLECTION_CURATION_ASSIGNEE_SUCCESS:
    case FETCH_COLLECTION_CURATION_SUCCESS:
      const { collectionId, curation } = action.payload

      const data = { ...state.data }

      if (!curation) {
        delete data[collectionId]
      } else {
        data[collectionId] = curation
      }

      return {
        ...state,
        data,
        loading: loadingReducer(state.loading, action),
        error: null
      }

    case APPROVE_COLLECTION_CURATION_SUCCESS: {
      const { collectionId } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [collectionId]: {
            ...state.data[collectionId],
            status: CurationStatus.APPROVED
          }
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }

    case REJECT_COLLECTION_CURATION_SUCCESS: {
      const { collectionId } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [collectionId]: {
            ...state.data[collectionId],
            status: CurationStatus.REJECTED
          }
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }

    case PUSH_COLLECTION_CURATION_SUCCESS:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }

    case FETCH_COLLECTION_CURATIONS_FAILURE:
    case FETCH_COLLECTION_CURATION_FAILURE:
    case PUSH_COLLECTION_CURATION_FAILURE:
    case REJECT_COLLECTION_CURATION_FAILURE:
    case APPROVE_COLLECTION_CURATION_FAILURE:
    case SET_COLLECTION_CURATION_ASSIGNEE_FAILURE:
      const { error } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    default:
      return state
  }
}
