import BN from 'bn.js'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, BuyThirdPartyItemTiersSuccessAction } from 'modules/tiers/actions'
import {} from 'modules/tiers/types'
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

export const INITIAL_STATE: ThirdPartyState = {
  data: {},
  loading: [],
  error: null
}

type ThirdPartyReducerAction =
  | FetchThirdPartiesRequestAction
  | FetchThirdPartiesSuccessAction
  | FetchThirdPartiesFailureAction
  | BuyThirdPartyItemTiersSuccessAction

export function thirdPartyReducer(state: ThirdPartyState = INITIAL_STATE, action: ThirdPartyReducerAction): ThirdPartyState {
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

    case BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS: {
      const { thirdParty, tier } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [thirdParty.id]: {
            ...state.data[thirdParty.id],
            maxItems: new BN(state.data[thirdParty.id].maxItems).add(new BN(tier.value)).toString()
          }
        }
      }
    }

    default:
      return state
  }
}
