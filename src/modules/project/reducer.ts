import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import {
  DeleteProjectAction,
  DELETE_PROJECT,
  EDIT_PROJECT_THUMBNAIL,
  EditProjectThumbnailAction,
  LOAD_PROJECTS_SUCCESS,
  LoadProjectsSuccessAction,
  LOAD_PROJECTS_REQUEST,
  LoadProjectsRequestAction,
  EditProjectAction,
  SetProjectAction,
  SET_PROJECT,
  CREATE_PROJECT,
  CreateProjectAction,
  LOAD_MANIFEST_REQUEST,
  LoadProjectsFailureAction,
  LOAD_PROJECTS_FAILURE,
  LoadManifestRequestAction,
  LoadManifestSuccessAction,
  LoadManifestFailureAction,
  LOAD_MANIFEST_SUCCESS,
  LOAD_MANIFEST_FAILURE,
  LoadPublicProjectRequestAction,
  LoadPublicProjectSuccessAction,
  LoadPublicProjectFailureAction,
  LOAD_PUBLIC_PROJECT_REQUEST,
  LOAD_PUBLIC_PROJECT_SUCCESS,
  LOAD_PUBLIC_PROJECT_FAILURE,
  ShareProjectAction,
  LoadTemplatesRequestAction,
  LoadTemplatesSuccessAction,
  LoadTemplatesFailureAction,
  LOAD_TEMPLATES_REQUEST,
  LOAD_TEMPLATES_SUCCESS,
  LOAD_TEMPLATES_FAILURE
} from 'modules/project/actions'

export type ProjectState = {
  data: ModelById<Project>
  loading: LoadingState
  error: string | null
}

export const INITIAL_STATE: ProjectState = {
  data: {},
  loading: [],
  error: null
}

export type ProjectReducerAction =
  | SetProjectAction
  | CreateProjectAction
  | EditProjectAction
  | ShareProjectAction
  | EditProjectThumbnailAction
  | DeleteProjectAction
  | LoadPublicProjectRequestAction
  | LoadPublicProjectSuccessAction
  | LoadPublicProjectFailureAction
  | LoadProjectsRequestAction
  | LoadProjectsSuccessAction
  | LoadProjectsFailureAction
  | LoadManifestRequestAction
  | LoadManifestSuccessAction
  | LoadManifestFailureAction
  | LoadTemplatesRequestAction
  | LoadTemplatesSuccessAction
  | LoadTemplatesFailureAction

export const projectReducer = (state = INITIAL_STATE, action: ProjectReducerAction): ProjectState => {
  switch (action.type) {
    case CREATE_PROJECT:
    case SET_PROJECT: {
      const { project } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [project.id]: { ...project, updatedAt: new Date().toISOString() }
        }
      }
    }
    case EDIT_PROJECT_THUMBNAIL: {
      const { id, thumbnail } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [id]: { ...state.data[id], thumbnail, updatedAt: new Date().toISOString() }
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
    case LOAD_PROJECTS_SUCCESS:
    case LOAD_TEMPLATES_SUCCESS: {
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
    case LOAD_PROJECTS_FAILURE:
    case LOAD_TEMPLATES_FAILURE:
    case LOAD_PUBLIC_PROJECT_FAILURE:
    case LOAD_MANIFEST_FAILURE: {
      const { error } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error
      }
    }
    case LOAD_PUBLIC_PROJECT_SUCCESS: {
      const { project, type } = action.payload
      if (type !== 'public') {
        return {
          ...state,
          loading: loadingReducer(state.loading, action)
        }
      }

      return {
        ...state,
        data: {
          ...state.data,
          [project.id]: project
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_MANIFEST_SUCCESS: {
      const { manifest } = action.payload
      const prevProject = state.data[manifest.project.id]
      if (prevProject) {
        return { ...state, loading: loadingReducer(state.loading, action) } // no need to update state if project is already there. This prevents changing the project in the state with an outdated one from the manifest in S3.
      }
      return {
        ...state,
        data: {
          ...state.data,
          [manifest.project.id]: { ...manifest.project }
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_PROJECTS_REQUEST:
    case LOAD_TEMPLATES_REQUEST:
    case LOAD_PUBLIC_PROJECT_REQUEST:
    case LOAD_MANIFEST_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    default:
      return state
  }
}
