import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'

import {
  SAVE_PROJECT_REQUEST,
  SaveProjectRequestAction,
  SaveProjectSuccessAction,
  SAVE_PROJECT_SUCCESS,
  SaveProjectFailureAction,
  SAVE_PROJECT_FAILURE
} from 'modules/sync/actions'
import { StorageLoadAction } from 'modules/common/types'
import { domainReducer, INITIAL_STATE as DOMAIN_INITIAL_STATE } from './domain/reducer'
import { success, init, request, failure, create, remove } from './domain/actions'
import { SyncState } from './types'
import { CREATE_PROJECT, CreateProjectAction, DELETE_PROJECT, DeleteProjectAction } from 'modules/project/actions'

const INITIAL_STATE: SyncState = {
  project: DOMAIN_INITIAL_STATE
}

export type SyncReducerAction =
  | SaveProjectRequestAction
  | SaveProjectSuccessAction
  | SaveProjectFailureAction
  | CreateProjectAction
  | DeleteProjectAction
  | StorageLoadAction

export const syncReducer = (state = INITIAL_STATE, action: SyncReducerAction): SyncState => {
  switch (action.type) {
    case STORAGE_LOAD: {
      const { payload } = action
      const projectIds = payload.project && payload.project.data ? Object.keys(payload.project.data) : []
      return {
        ...state,
        project: domainReducer(state.project, init(projectIds))
      }
    }
    case SAVE_PROJECT_REQUEST: {
      const { project } = action.payload
      return {
        ...state,
        project: domainReducer(state.project, request(project.id))
      }
    }
    case SAVE_PROJECT_SUCCESS: {
      const { project } = action.payload
      return {
        ...state,
        project: domainReducer(state.project, success(project.id))
      }
    }
    case SAVE_PROJECT_FAILURE: {
      const { project, error } = action.payload
      return {
        ...state,
        project: domainReducer(state.project, failure(project.id, error))
      }
    }
    case CREATE_PROJECT: {
      const { project } = action.payload
      return {
        ...state,
        project: domainReducer(state.project, create(project.id))
      }
    }
    case DELETE_PROJECT: {
      const { project } = action.payload
      return {
        ...state,
        project: domainReducer(state.project, remove(project.id))
      }
    }
    default:
      return state
  }
}
