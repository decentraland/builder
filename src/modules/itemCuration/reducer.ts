import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FETCH_ITEM_CURATIONS_REQUEST,
  FETCH_ITEM_CURATIONS_SUCCESS,
  FETCH_ITEM_CURATIONS_FAILURE,
  FetchItemCurationsRequestAction,
  FetchItemCurationsFailureAction,
  FetchItemCurationsSuccessAction
} from './actions'
import { ItemCuration } from './types'

export type ItemCurationState = {
  data: Record<string, ItemCuration[]>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: ItemCurationState = {
  data: {},
  loading: [],
  error: null
}

type CurationReducerAction = FetchItemCurationsRequestAction | FetchItemCurationsSuccessAction | FetchItemCurationsFailureAction

export function curationReducer(state: ItemCurationState = INITIAL_STATE, action: CurationReducerAction): ItemCurationState {
  switch (action.type) {
    case FETCH_ITEM_CURATIONS_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }

    case FETCH_ITEM_CURATIONS_SUCCESS:
      const { itemCurations, collectionId } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [collectionId]: itemCurations
        },
        error: null
      }

    case FETCH_ITEM_CURATIONS_FAILURE:
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
