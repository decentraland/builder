import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'

import {
  DEPLOY_TO_POOL_REQUEST,
  DEPLOY_TO_POOL_SUCCESS,
  DEPLOY_TO_POOL_FAILURE,
  DeployToPoolRequestAction,
  DeployToPoolSuccessAction,
  DeployToPoolFailureAction,
  SetProgressAction,
  SET_PROGRESS,
  SetStageAction,
  SET_STAGE
} from './actions'

export type DeploymentStage = 'record' | 'upload' | null

export type DeploymentState = {
  data: {
    thumbnail: string | null
    progress: number
    stage: DeploymentStage
  }
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: DeploymentState = {
  data: {
    thumbnail: null,
    progress: 0,
    stage: null
  },
  loading: [],
  error: null
}

export type DeploymentReducerAction =
  | DeployToPoolRequestAction
  | DeployToPoolSuccessAction
  | DeployToPoolFailureAction
  | SetProgressAction
  | SetStageAction

export const deploymentReducer = (state = INITIAL_STATE, action: DeploymentReducerAction): DeploymentState => {
  switch (action.type) {
    case DEPLOY_TO_POOL_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case DEPLOY_TO_POOL_SUCCESS: {
      return {
        ...state,
        data: {
          ...state.data,
          thumbnail: action.payload.thumbnail,
          stage: null
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case DEPLOY_TO_POOL_FAILURE: {
      return {
        ...state,
        data: {
          ...state.data,
          stage: null
        },
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case SET_PROGRESS: {
      return {
        ...state,
        data: {
          ...state.data,
          progress: action.payload.progress
        }
      }
    }
    case SET_STAGE: {
      return {
        ...state,
        data: {
          ...state.data,
          stage: action.payload.stage,
          progress: 0
        }
      }
    }
    default:
      return state
  }
}
