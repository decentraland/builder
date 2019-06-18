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
import { ProgressStage } from './types'

export type DeploymentState = {
  data: {
    remoteCID: string | null
    isDirty: boolean
    progress: {
      stage: ProgressStage
      value: number
    }
  }
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: DeploymentState = {
  data: {
    progress: {
      stage: ProgressStage.NONE,
      value: 0
    },
    remoteCID: null,
    isDirty: true
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
          ...state.data
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case DEPLOY_TO_POOL_FAILURE: {
      return {
        ...state,
        data: {
          ...state.data
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
          progress: {
            ...state.data.progress,
            value: action.payload.progress
          }
        }
      }
    }
    case SET_STAGE: {
      return {
        ...state,
        data: {
          ...state.data,
          progress: {
            ...state.data.progress,
            value: 0
          }
        }
      }
    }
    default:
      return state
  }
}
