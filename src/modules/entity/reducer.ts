import { Entity } from 'dcl-catalyst-commons'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  DeployEntitiesFailureAction,
  DeployEntitiesRequestAction,
  DeployEntitiesSuccessAction,
  DEPLOY_ENTITIES_FAILURE,
  DEPLOY_ENTITIES_REQUEST,
  DEPLOY_ENTITIES_SUCCESS,
  FetchEntitiesByIdsFailureAction,
  FetchEntitiesByIdsRequestAction,
  FetchEntitiesByIdsSuccessAction,
  FetchEntitiesByPointersFailureAction,
  FetchEntitiesByPointersRequestAction,
  FetchEntitiesByPointersSuccessAction,
  FETCH_ENTITIES_BY_IDS_FAILURE,
  FETCH_ENTITIES_BY_IDS_REQUEST,
  FETCH_ENTITIES_BY_IDS_SUCCESS,
  FETCH_ENTITIES_BY_POINTERS_FAILURE,
  FETCH_ENTITIES_BY_POINTERS_REQUEST,
  FETCH_ENTITIES_BY_POINTERS_SUCCESS
} from './actions'

export type EntityState = {
  data: Record<string, Entity>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: EntityState = {
  data: {},
  loading: [],
  error: null
}

type EntityReducerAction =
  | FetchEntitiesByPointersRequestAction
  | FetchEntitiesByPointersSuccessAction
  | FetchEntitiesByPointersFailureAction
  | FetchEntitiesByIdsRequestAction
  | FetchEntitiesByIdsSuccessAction
  | FetchEntitiesByIdsFailureAction
  | DeployEntitiesRequestAction
  | DeployEntitiesSuccessAction
  | DeployEntitiesFailureAction

export function entityReducer(state: EntityState = INITIAL_STATE, action: EntityReducerAction): EntityState {
  switch (action.type) {
    case FETCH_ENTITIES_BY_POINTERS_REQUEST:
    case FETCH_ENTITIES_BY_IDS_REQUEST:
    case DEPLOY_ENTITIES_REQUEST:
    case DEPLOY_ENTITIES_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    case FETCH_ENTITIES_BY_POINTERS_SUCCESS:
    case FETCH_ENTITIES_BY_IDS_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          ...action.payload.entities.reduce((obj, entity) => {
            obj[entity.id] = entity
            return obj
          }, {} as EntityState['data'])
        }
      }
    }
    case FETCH_ENTITIES_BY_POINTERS_FAILURE:
    case FETCH_ENTITIES_BY_IDS_FAILURE:
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
