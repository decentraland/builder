import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  ApproveCurationFailureAction,
  ApproveCurationRequestAction,
  ApproveCurationSuccessAction,
  APPROVE_CURATION_FAILURE,
  APPROVE_CURATION_SUCCESS,
  FetchCurationFailureAction,
  FetchCurationRequestAction,
  FetchCurationsFailureAction,
  FetchCurationsRequestAction,
  FetchCurationsSuccessAction,
  FetchCurationSuccessAction,
  FETCH_CURATIONS_FAILURE,
  FETCH_CURATIONS_REQUEST,
  FETCH_CURATIONS_SUCCESS,
  FETCH_CURATION_FAILURE,
  FETCH_CURATION_REQUEST,
  FETCH_CURATION_SUCCESS,
  PushCurationFailureAction,
  PushCurationRequestAction,
  PushCurationSuccessAction,
  PUSH_CURATION_FAILURE,
  PUSH_CURATION_REQUEST,
  PUSH_CURATION_SUCCESS,
  RejectCurationFailureAction,
  RejectCurationRequestAction,
  RejectCurationSuccessAction,
  REJECT_CURATION_FAILURE,
  REJECT_CURATION_SUCCESS
} from './actions'
import { Curation, CurationStatus } from './types'

export type CurationState = {
  data: Record<string, Curation>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: CurationState = {
  data: {},
  loading: [],
  error: null
}

type CurationReducerAction =
  | FetchCurationsRequestAction
  | FetchCurationsSuccessAction
  | FetchCurationsFailureAction
  | FetchCurationRequestAction
  | FetchCurationSuccessAction
  | FetchCurationFailureAction
  | PushCurationRequestAction
  | PushCurationSuccessAction
  | PushCurationFailureAction
  | ApproveCurationRequestAction
  | ApproveCurationSuccessAction
  | ApproveCurationFailureAction
  | RejectCurationRequestAction
  | RejectCurationSuccessAction
  | RejectCurationFailureAction

export function curationReducer(state: CurationState = INITIAL_STATE, action: CurationReducerAction): CurationState {
  switch (action.type) {
    case FETCH_CURATIONS_REQUEST:
    case FETCH_CURATION_REQUEST:
    case PUSH_CURATION_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }

    case FETCH_CURATIONS_SUCCESS:
      const { curations } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: curations.reduce((acc, curation) => ({ ...acc, [curation.collectionId]: curation }), {}),
        error: null
      }

    case FETCH_CURATION_SUCCESS:
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

    case APPROVE_CURATION_SUCCESS: {
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

    case REJECT_CURATION_SUCCESS: {
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

    case PUSH_CURATION_SUCCESS:
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }

    case FETCH_CURATIONS_FAILURE:
    case FETCH_CURATION_FAILURE:
    case PUSH_CURATION_FAILURE:
    case REJECT_CURATION_FAILURE:
    case APPROVE_CURATION_FAILURE:
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
