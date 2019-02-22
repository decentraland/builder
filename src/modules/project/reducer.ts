import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import {
  CreateProjectAction,
  CREATE_PROJECT,
  EDIT_PROJECT,
  EditProjectAction,
  DeleteProjectAction,
  DELETE_PROJECT
} from 'modules/project/actions'

export type ProjectState = {
  data: ModelById<Project>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: ProjectState = {
  data: {},
  loading: [],
  error: null
}

export type ProjectReducerAction = CreateProjectAction | EditProjectAction | DeleteProjectAction

export const projectReducer = (state = INITIAL_STATE, action: ProjectReducerAction): ProjectState => {
  switch (action.type) {
    case CREATE_PROJECT: {
      const { project } = action.payload

      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [project.id]: { ...project }
        }
      }
    }
    case EDIT_PROJECT: {
      const { id, project } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [id]: {
            ...state.data[id],
            ...project
          }
        }
      }
    }

    case DELETE_PROJECT: {
      const { project } = action.payload
      const newState = {
        ...state,
        data: {
          ...state.data
        }
      }
      delete newState.data[project.id]
      return newState
    }
    default:
      return state
  }
}
