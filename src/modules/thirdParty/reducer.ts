import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchThirdPartiesRequestAction,
  FetchThirdPartiesSuccessAction,
  FetchThirdPartiesFailureAction,
  FETCH_THIRD_PARTIES_REQUEST,
  FETCH_THIRD_PARTIES_SUCCESS,
  FETCH_THIRD_PARTIES_FAILURE
} from './actions'
import { ThirdParty } from './types'

export type ThirdPartyState = {
  data: Record<string, ThirdParty>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: ThirdPartyState = {
  data: {},
  loading: [],
  error: null
}

type ThirdPartyReducerAction = FetchThirdPartiesRequestAction | FetchThirdPartiesSuccessAction | FetchThirdPartiesFailureAction

export function thirdPartyReducer(state: ThirdPartyState = INITIAL_STATE, action: ThirdPartyReducerAction) {
  switch (action.type) {
    case FETCH_THIRD_PARTIES_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_THIRD_PARTIES_SUCCESS: {
      const { thirdParties } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...thirdParties.reduce((obj, thirdParty) => {
            obj[thirdParty.id] = { ...thirdParty }
            return obj
          }, {} as Record<string, ThirdParty>)
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_THIRD_PARTIES_FAILURE: {
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
