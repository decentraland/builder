import { FetchTransactionSuccessAction } from 'decentraland-dapps/dist/modules/transaction/actions'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FetchThirdPartiesRequestAction,
  FetchThirdPartiesSuccessAction,
  FetchThirdPartiesFailureAction,
  FETCH_THIRD_PARTIES_REQUEST,
  FETCH_THIRD_PARTIES_SUCCESS,
  FETCH_THIRD_PARTIES_FAILURE,
  FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST,
  FetchThirdPartyAvailableSlotsRequestAction,
  FetchThirdPartyAvailableSlotsSuccessAction,
  FETCH_THIRD_PARTY_AVAILABLE_SLOTS_SUCCESS,
  FETCH_THIRD_PARTY_AVAILABLE_SLOTS_FAILURE,
  FetchThirdPartyAvailableSlotsFailureAction
} from './actions'
import { ThirdParty } from './types'

export type ThirdPartyState = {
  data: Record<string, ThirdParty>
  itemSlotPrice: number | null
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: ThirdPartyState = {
  data: {},
  itemSlotPrice: null,
  loading: [],
  error: null
}

type ThirdPartyReducerAction =
  | FetchThirdPartiesRequestAction
  | FetchThirdPartiesSuccessAction
  | FetchThirdPartiesFailureAction
  | FetchTransactionSuccessAction
  | FetchThirdPartyAvailableSlotsRequestAction
  | FetchThirdPartyAvailableSlotsSuccessAction
  | FetchThirdPartyAvailableSlotsFailureAction

export function thirdPartyReducer(state: ThirdPartyState = INITIAL_STATE, action: ThirdPartyReducerAction): ThirdPartyState {
  switch (action.type) {
    case FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST:
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
    case FETCH_THIRD_PARTY_AVAILABLE_SLOTS_SUCCESS: {
      const { thirdPartyId, availableSlots } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [thirdPartyId]: {
            ...state.data[thirdPartyId],
            availableSlots
          }
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }

    case FETCH_THIRD_PARTY_AVAILABLE_SLOTS_FAILURE:
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
