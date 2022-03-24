import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { FinishTPApprovalFlowAction, FINISH_TP_APPROVAL_FLOW } from 'modules/collection/actions'
import {
  PublishAndPushChangesThirdPartyItemsFailureAction,
  PublishAndPushChangesThirdPartyItemsRequestAction,
  PublishAndPushChangesThirdPartyItemsSuccessAction,
  PublishThirdPartyItemsFailureAction,
  PublishThirdPartyItemsRequestAction,
  PublishThirdPartyItemsSuccessAction,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
  PUBLISH_THIRD_PARTY_ITEMS_FAILURE,
  PUBLISH_THIRD_PARTY_ITEMS_REQUEST,
  PUBLISH_THIRD_PARTY_ITEMS_SUCCESS,
  PushChangesThirdPartyItemsFailureAction,
  PushChangesThirdPartyItemsRequestAction,
  PushChangesThirdPartyItemsSuccessAction,
  PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
  PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST,
  PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS
} from 'modules/thirdParty/actions'
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

type CurationReducerAction =
  | FetchItemCurationsRequestAction
  | FetchItemCurationsSuccessAction
  | FetchItemCurationsFailureAction
  | PublishThirdPartyItemsRequestAction
  | PublishThirdPartyItemsSuccessAction
  | PublishThirdPartyItemsFailureAction
  | PushChangesThirdPartyItemsRequestAction
  | PushChangesThirdPartyItemsSuccessAction
  | PushChangesThirdPartyItemsFailureAction
  | PublishAndPushChangesThirdPartyItemsRequestAction
  | PublishAndPushChangesThirdPartyItemsSuccessAction
  | PublishAndPushChangesThirdPartyItemsFailureAction
  | FinishTPApprovalFlowAction

export function itemCurationReducer(state: ItemCurationState = INITIAL_STATE, action: CurationReducerAction): ItemCurationState {
  switch (action.type) {
    case PUBLISH_THIRD_PARTY_ITEMS_REQUEST:
    case PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST:
    case PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST:
    case FETCH_ITEM_CURATIONS_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    case FINISH_TP_APPROVAL_FLOW: {
      const { collection, itemCurations } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [collection.id]: [...itemCurations]
        },
        error: null
      }
    }
    case FETCH_ITEM_CURATIONS_SUCCESS: {
      const { itemCurations, collectionId } = action.payload

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [collectionId]: [...itemCurations]
        },
        error: null
      }
    }
    case PUBLISH_THIRD_PARTY_ITEMS_SUCCESS: {
      const { itemCurations, collectionId } = action.payload
      const oldItemCurations = state.data[collectionId]
      const mergedItemCurations = oldItemCurations ? [...oldItemCurations, ...itemCurations] : [...itemCurations]
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [collectionId]: mergedItemCurations
        },
        error: null
      }
    }
    case PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS:
    case PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS: {
      const { itemCurations: newItemCurations, collectionId } = action.payload
      const oldItemCurations = state.data[collectionId]
      const newCurationsItemIds = newItemCurations.map(newItemCuration => newItemCuration.itemId)
      const oldCurationsNotIncludedInNewOnes = oldItemCurations.filter(
        oldItemCuration => !newCurationsItemIds.includes(oldItemCuration.itemId)
      )

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [collectionId]: [...oldCurationsNotIncludedInNewOnes, ...newItemCurations]
        },
        error: null
      }
    }
    case PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE:
    case PUBLISH_THIRD_PARTY_ITEMS_FAILURE:
    case PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE:
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
