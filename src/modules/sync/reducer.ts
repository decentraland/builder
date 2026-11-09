import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'

import { StorageLoadAction } from 'modules/common/types'
import { domainReducer, INITIAL_STATE as DOMAIN_INITIAL_STATE } from './domain/reducer'
import { init, remove } from './domain/actions'
import { SyncState } from './types'
import { DELETE_PROJECT, DeleteProjectAction } from 'modules/project/actions'

const INITIAL_STATE: SyncState = {
  project: DOMAIN_INITIAL_STATE
}

export type SyncReducerAction = DeleteProjectAction | StorageLoadAction

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
