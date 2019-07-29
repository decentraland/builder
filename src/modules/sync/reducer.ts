import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import {
  SAVE_PROJECT_REQUEST,
  SaveProjectRequestAction,
  SaveProjectSuccessAction,
  SAVE_PROJECT_SUCCESS,
  SaveProjectFailureAction,
  SAVE_PROJECT_FAILURE
} from 'modules/sync/actions'

export type SyncState = {
  localProjectIds: string[]
  loading: string[]
  errors: Record<string, string>
}

const INITIAL_STATE: SyncState = {
  localProjectIds: [],
  loading: [],
  errors: {}
}

export type SyncReducerAction = SaveProjectRequestAction | SaveProjectSuccessAction | SaveProjectFailureAction | any

export const syncReducer = (state = INITIAL_STATE, action: SyncReducerAction): SyncState => {
  switch (action.type) {
    case STORAGE_LOAD: {
      const { payload } = action
      return {
        ...state,
        localProjectIds: Object.keys(payload.project.data)
      }
    }
    case SAVE_PROJECT_REQUEST: {
      const { project } = action.payload
      return {
        ...state,
        loading: [...state.loading, project.id]
      }
    }
    case SAVE_PROJECT_SUCCESS: {
      const { project } = action.payload
      return {
        ...state,
        localProjectIds: state.localProjectIds.filter(id => id !== project.id),
        loading: state.loading.filter(id => id !== project.id)
      }
    }
    case SAVE_PROJECT_FAILURE: {
      const { project, error } = action.payload
      return {
        ...state,
        errors: {
          ...state.errors,
          [project.id]: error
        }
      }
    }
    default:
      return state
  }
}
