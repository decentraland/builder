import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  PublishThirdPartyItemsFailureAction,
  PublishThirdPartyItemsSuccessAction,
  PUBLISH_THIRD_PARTY_ITEMS_FAILURE,
  PUBLISH_THIRD_PARTY_ITEMS_SUCCESS,
  PushChangesThirdPartyItemsFailureAction,
  PushChangesThirdPartyItemsSuccessAction,
  PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE,
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
  | PublishThirdPartyItemsSuccessAction
  | PublishThirdPartyItemsFailureAction
  | PushChangesThirdPartyItemsSuccessAction
  | PushChangesThirdPartyItemsFailureAction

export function itemCurationReducer(state: ItemCurationState = INITIAL_STATE, action: CurationReducerAction): ItemCurationState {
  switch (action.type) {
    case FETCH_ITEM_CURATIONS_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }

    case FETCH_ITEM_CURATIONS_SUCCESS: {
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
          [action.payload.collectionId]: mergedItemCurations
        },
        error: null
      }
    }

    case PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS: {
      const { itemCurations, collectionId } = action.payload
      const oldItemCurations = state.data[collectionId]
      const mergedItemCurations = oldItemCurations.map(itemCuration => {
        return itemCurations.find(newItemCuration => newItemCuration.itemId === itemCuration.itemId) || itemCuration
      })

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [action.payload.collectionId]: mergedItemCurations
        },
        error: null
      }
    }

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
