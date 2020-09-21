import { Land, Authorization } from './types'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchLandsRequestAction,
  FetchLandsSuccessAction,
  FetchLandsFailureAction,
  FETCH_LANDS_REQUEST,
  FETCH_LANDS_SUCCESS,
  FETCH_LANDS_FAILURE,
  SetNameResolverRequestAction,
  SetNameResolverSuccessAction,
  SetNameResolverFailureAction,
  SET_NAME_RESOLVER_REQUEST,
  SET_NAME_RESOLVER_SUCCESS,
  SET_NAME_RESOLVER_FAILURE
} from './actions'

export type LandState = {
  data: Record<string, Land[]>
  authorizations: Authorization[]
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: LandState = {
  data: {},
  authorizations: [],
  loading: [],
  error: null,
}

export type LandReducerAction = FetchLandsRequestAction      | FetchLandsSuccessAction      | FetchLandsFailureAction      |
                                SetNameResolverRequestAction | SetNameResolverSuccessAction | SetNameResolverFailureAction

export function landReducer(state: LandState = INITIAL_STATE, action: LandReducerAction): LandState {
  switch (action.type) {
    case FETCH_LANDS_REQUEST: {
      return {
        ...state,
        authorizations: [],
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_LANDS_SUCCESS: {
      const { address, lands, authorizations } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [address]: lands
        },
        authorizations,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_LANDS_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        error
      }
    }
    case SET_NAME_RESOLVER_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case SET_NAME_RESOLVER_SUCCESS: {
      const { owner, ens, land } = action.payload
      const lands:Land[] = JSON.parse(JSON.stringify(state.data[owner]))
      if (!lands) {
        return state
      }
      const landRef = lands.find(l => l.id === land.id)
      if (!landRef) {
        return state
      }
      landRef.ensList = landRef.ensList ? landRef.ensList.concat([ens]) : [ens]
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [owner]: lands
        }
      }
    }
    case SET_NAME_RESOLVER_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        error
      }
    }
    default:
      return state
  }
}
