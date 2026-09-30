import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'

import { StorageLoadAction } from 'modules/common/types'
import { domainReducer, INITIAL_STATE as DOMAIN_INITIAL_STATE } from './domain/reducer'
import { init, create, remove } from './domain/actions'
import { SyncState } from './types'
import { CREATE_PROJECT, CreateProjectAction, DELETE_PROJECT, DeleteProjectAction } from 'modules/project/actions'

const INITIAL_STATE: SyncState = {
  project: DOMAIN_INITIAL_STATE
}

export type SyncReducerAction = CreateProjectAction | DeleteProjectAction | StorageLoadAction

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
