import { loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { FETCH_THIRD_PARTY_ITEM_TIERS_FAILURE, FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST, FETCH_THIRD_PARTY_ITEM_TIERS_SUCCESS } from './action'
import { TiersState } from './types'

const INITIAL_STATE: TiersState = {
  data: {
    thirdParty: []
  },
  loading: [],
  error: null
}

export function tiersReducer(state = INITIAL_STATE, action: any): TiersState {
  switch (action.type) {
    case FETCH_THIRD_PARTY_ITEM_TIERS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case FETCH_THIRD_PARTY_ITEM_TIERS_SUCCESS: {
      const { tiers } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          thirdParty: tiers
        }
      }
    }

    case FETCH_THIRD_PARTY_ITEM_TIERS_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }

    default:
      return state
  }
}
