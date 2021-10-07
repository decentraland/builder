import { DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  DeployEntitiesFailureAction,
  DeployEntitiesRequestAction,
  DeployEntitiesSuccessAction,
  DEPLOY_ENTITIES_FAILURE,
  DEPLOY_ENTITIES_REQUEST,
  DEPLOY_ENTITIES_SUCCESS,
  FetchEntitiesFailureAction,
  FetchEntitiesRequestAction,
  FetchEntitiesSuccessAction,
  FETCH_ENTITIES_FAILURE,
  FETCH_ENTITIES_REQUEST,
  FETCH_ENTITIES_SUCCESS
} from './actions'

export type EntityState = {
  data: Record<string, DeploymentWithMetadataContentAndPointers>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: EntityState = {
  data: {},
  loading: [],
  error: null
}

type EntityReducerAction =
  | FetchEntitiesRequestAction
  | FetchEntitiesSuccessAction
  | FetchEntitiesFailureAction
  | DeployEntitiesRequestAction
  | DeployEntitiesSuccessAction
  | DeployEntitiesFailureAction

export function entityReducer(state: EntityState = INITIAL_STATE, action: EntityReducerAction): EntityState {
  switch (action.type) {
    case FETCH_ENTITIES_REQUEST:
    case DEPLOY_ENTITIES_REQUEST:
    case DEPLOY_ENTITIES_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_ENTITIES_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          ...action.payload.entities.reduce((obj, entity) => {
            obj[entity.entityId] = entity
            return obj
          }, {} as EntityState['data'])
        }
      }
    }
    case FETCH_ENTITIES_FAILURE:
    case DEPLOY_ENTITIES_FAILURE: {
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
