import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'

import { PoolGroup } from './types'
import {
  LoadPoolGroupsRequestAction,
  LoadPoolGroupsSuccessAction,
  LoadPoolGroupsFailureAction,
  LOAD_POOL_GROUPS_REQUEST,
  LOAD_POOL_GROUPS_FAILURE,
  LOAD_POOL_GROUPS_SUCCESS
} from './actions'

export type PoolGroupState = {
  data: ModelById<PoolGroup>
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: PoolGroupState = {
  data: {},
  loading: [],
  error: {}
}

export type PoolGroupAction = LoadPoolGroupsRequestAction | LoadPoolGroupsSuccessAction | LoadPoolGroupsFailureAction

export const poolGroupReducer = (state = INITIAL_STATE, action: PoolGroupAction): PoolGroupState => {
  switch (action.type) {
    case LOAD_POOL_GROUPS_REQUEST:
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }

    case LOAD_POOL_GROUPS_SUCCESS: {
      const { poolGroups } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...poolGroups
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_POOL_GROUPS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    default:
      return state
  }
}
