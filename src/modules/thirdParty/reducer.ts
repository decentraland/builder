import { FetchTransactionSuccessAction } from 'decentraland-dapps/dist/modules/transaction/actions'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ThirdPartyError } from 'modules/collection/utils'
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
  FetchThirdPartyAvailableSlotsFailureAction,
  DeployBatchedThirdPartyItemsRequestAction,
  DeployBatchedThirdPartyItemsSuccessAction,
  DeployBatchedThirdPartyItemsFailureAction,
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST,
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE,
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS,
  DisableThirdPartySuccessAction,
  DisableThirdPartyFailureAction,
  DisableThirdPartyRequestAction,
  DISABLE_THIRD_PARTY_SUCCESS,
  DISABLE_THIRD_PARTY_REQUEST,
  DISABLE_THIRD_PARTY_FAILURE,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
  PublishAndPushChangesThirdPartyItemsFailureAction,
  PublishAndPushChangesThirdPartyItemsSuccessAction,
  PublishAndPushChangesThirdPartyItemsRequestAction,
  FetchThirdPartyRequestAction,
  FetchThirdPartySuccessAction,
  FetchThirdPartyFailureAction,
  FETCH_THIRD_PARTY_REQUEST,
  FETCH_THIRD_PARTY_SUCCESS,
  FETCH_THIRD_PARTY_FAILURE,
  FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
  FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
  FinishPublishAndPushChangesThirdPartyItemsSuccessAction,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
  FinishPublishAndPushChangesThirdPartyItemsFailureAction,
  FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST
} from './actions'
import { ThirdParty } from './types'

export type ThirdPartyState = {
  data: Record<string, ThirdParty>
  loading: LoadingState
  error: string | null
  errors: ThirdPartyError[]
}

export const INITIAL_STATE: ThirdPartyState = {
  data: {},
  loading: [],
  error: null,
  errors: []
}

type ThirdPartyReducerAction =
  | FetchThirdPartiesRequestAction
  | FetchThirdPartiesSuccessAction
  | FetchThirdPartiesFailureAction
  | FetchTransactionSuccessAction
  | FetchThirdPartyAvailableSlotsRequestAction
  | FetchThirdPartyAvailableSlotsSuccessAction
  | FetchThirdPartyAvailableSlotsFailureAction
  | DeployBatchedThirdPartyItemsRequestAction
  | DeployBatchedThirdPartyItemsSuccessAction
  | DeployBatchedThirdPartyItemsFailureAction
  | DisableThirdPartySuccessAction
  | DisableThirdPartyFailureAction
  | DisableThirdPartyRequestAction
  | PublishAndPushChangesThirdPartyItemsRequestAction
  | PublishAndPushChangesThirdPartyItemsFailureAction
  | PublishAndPushChangesThirdPartyItemsSuccessAction
  | FinishPublishAndPushChangesThirdPartyItemsSuccessAction
  | FinishPublishAndPushChangesThirdPartyItemsFailureAction
  | FetchThirdPartyRequestAction
  | FetchThirdPartySuccessAction
  | FetchThirdPartyFailureAction

export function thirdPartyReducer(state: ThirdPartyState = INITIAL_STATE, action: ThirdPartyReducerAction): ThirdPartyState {
  switch (action.type) {
    case DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST:
    case FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST:
    case FETCH_THIRD_PARTY_REQUEST:
    case PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST:
    case DISABLE_THIRD_PARTY_REQUEST:
    case FETCH_THIRD_PARTIES_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        errors: []
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
    case FETCH_THIRD_PARTY_SUCCESS: {
      const { thirdParty } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [thirdParty.id]: thirdParty
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }

    case DISABLE_THIRD_PARTY_SUCCESS: {
      const { thirdPartyId } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [thirdPartyId]: {
            ...state.data[thirdPartyId],
            isApproved: false
          }
        },
        loading: loadingReducer(state.loading, action)
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
    case PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS:
      return {
        ...state,
        loading: loadingReducer(loadingReducer(state.loading, action), { type: FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST })
      }

    case DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_THIRD_PARTY_FAILURE:
    case DISABLE_THIRD_PARTY_FAILURE:
    case FETCH_THIRD_PARTY_AVAILABLE_SLOTS_FAILURE:
    case PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE:
    case FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE:
    case FETCH_THIRD_PARTIES_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        errors: action.payload.errors,
        error: action.payload.errorMessage || null
      }
    }
    case FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS: {
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.thirdParty.id]: {
            ...state.data[action.payload.thirdParty.id],
            published: true
          }
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }

    default:
      return state
  }
}
