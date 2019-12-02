import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Pool } from 'modules/pool/types'
import {
  LOAD_POOLS_SUCCESS,
  LoadPoolsSuccessAction,
  LOAD_POOLS_REQUEST,
  LoadPoolsRequestAction,
  LoadPoolsFailureAction,
  LOAD_POOLS_FAILURE,
  LIKE_POOL_REQUEST,
  LIKE_POOL_SUCCESS,
  LIKE_POOL_FAILURE,
  LikePoolRequestAction,
  LikePoolSuccessAction,
  LikePoolFailureAction
} from 'modules/pool/actions'
import { LOAD_PUBLIC_PROJECT_SUCCESS, LoadPublicProjectSuccessAction } from 'modules/project/actions'

export type PoolState = {
  data: ModelById<Pool>
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: PoolState = {
  data: {},
  loading: [],
  error: {}
}

export type PoolReducerAction =
  | LoadPoolsRequestAction
  | LoadPoolsSuccessAction
  | LoadPoolsFailureAction
  | LikePoolRequestAction
  | LikePoolSuccessAction
  | LikePoolFailureAction
  | LoadPublicProjectSuccessAction

export const poolReducer = (state = INITIAL_STATE, action: PoolReducerAction): PoolState => {
  switch (action.type) {
    case LIKE_POOL_FAILURE:
    case LIKE_POOL_SUCCESS:
    case LOAD_POOLS_REQUEST:
    case LOAD_POOLS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_POOLS_SUCCESS: {
      const { projects } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...projects
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_PUBLIC_PROJECT_SUCCESS: {
      const { project, type } = action.payload
      if (type !== 'pool') {
        return state
      }

      return {
        ...state,
        data: {
          ...state.data,
          [project.id]: project as Pool
        }
      }
    }
    case LIKE_POOL_REQUEST: {
      const { pool, like } = action.payload

      if (!state.data[pool]) {
        return state
      }

      const addition = like ? 1 : -1
      const currentPool = state.data[pool]

      return  {
        ...state,
        data: {
          ...state.data,
          [pool]: {
            ...currentPool,
            likes: (currentPool.likes || 0) + addition,
            like,
          }
        }
      }
    }
    default:
      return state
  }
}
