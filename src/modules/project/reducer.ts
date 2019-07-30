import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import {
  CreateProjectAction,
  CREATE_PROJECT,
  EDIT_PROJECT_REQUEST,
  EDIT_PROJECT_SUCCESS,
  EDIT_PROJECT_FAILURE,
  EditProjectRequestAction,
  EditProjectSuccessAction,
  EditProjectFailureAction,
  DeleteProjectAction,
  DELETE_PROJECT,
  EDIT_PROJECT_THUMBNAIL,
  EditProjectThumbnailAction,
  LOAD_PROJECTS_SUCCESS,
  LoadProjectsSuccessAction,
  LOAD_PROJECTS_REQUEST,
  LoadProjectsRequestAction
} from 'modules/project/actions'

export type ProjectState = {
  data: ModelById<Project>
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: ProjectState = {
  data: {},
  loading: [],
  error: {}
}

export type ProjectReducerAction =
  | CreateProjectAction
  | EditProjectRequestAction
  | EditProjectSuccessAction
  | EditProjectFailureAction
  | EditProjectThumbnailAction
  | DeleteProjectAction
  | LoadProjectsRequestAction
  | LoadProjectsSuccessAction

export const projectReducer = (state = INITIAL_STATE, action: ProjectReducerAction): ProjectState => {
  switch (action.type) {
    case CREATE_PROJECT: {
      const { project } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [project.id]: { ...project }
        }
      }
    }
    case EDIT_PROJECT_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case EDIT_PROJECT_SUCCESS: {
      const { id, project } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [id]: { ...state.data[id], ...project }
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case EDIT_PROJECT_FAILURE: {
      const { projectId, error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: {
          ...state.error,
          [projectId]: error
        }
      }
    }
    case EDIT_PROJECT_THUMBNAIL: {
      const { id, thumbnail } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [id]: { ...state.data[id], thumbnail }
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
    case LOAD_PROJECTS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_PROJECTS_SUCCESS: {
      const { projects } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...projects
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    default:
      return state
  }
}
