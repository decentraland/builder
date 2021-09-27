import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchCurationsFailureAction,
  FetchCurationsRequestAction,
  FetchCurationsSuccessAction,
  FETCH_CURATIONS_FAILURE,
  FETCH_CURATIONS_REQUEST,
  FETCH_CURATIONS_SUCCESS
} from './actions'
import { Curation } from './types'

export type CurationState = {
  data: Record<string, Curation>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: CurationState = {
  data: {},
  loading: [],
  error: null
}

type CurationReducerAction = FetchCurationsRequestAction | FetchCurationsSuccessAction | FetchCurationsFailureAction

export function curationReducer(state: CurationState = INITIAL_STATE, action: CurationReducerAction): CurationState {
  switch (action.type) {
    case FETCH_CURATIONS_REQUEST:
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
    case FETCH_CURATIONS_FAILURE:
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
