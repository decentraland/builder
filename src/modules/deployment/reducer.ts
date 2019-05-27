import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'

import {
  DEPLOY_TO_POOL_REQUEST,
  DEPLOY_TO_POOL_SUCCESS,
  DEPLOY_TO_POOL_FAILURE,
  DeployToPoolRequestAction,
  DeployToPoolSuccessAction,
  DeployToPoolFailureAction
} from './actions'

export type DeploymentState = {
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: DeploymentState = {
  loading: [],
  error: null
}

export type DeploymentReducerAction = DeployToPoolRequestAction | DeployToPoolSuccessAction | DeployToPoolFailureAction

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
        loading: loadingReducer(state.loading, action)
      }
    }
    case DEPLOY_TO_POOL_FAILURE: {
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
