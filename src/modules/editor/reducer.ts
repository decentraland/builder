import {
  SetGizmoAction,
  TogglePreviewAction,
  ToggleSidebarAction,
  SET_GIZMO,
  TOGGLE_PREVIEW,
  TOGGLE_SIDEBAR,
  SelectEntityAction,
  SELECT_ENTITY,
  DeselectEntityAction,
  DESELECT_ENTITY,
  SET_EDITOR_READY,
  CLOSE_EDITOR,
  SetEditorReadyAction,
  CloseEditorAction,
  ToggleSnapToGridAction,
  TOGGLE_SNAP_TO_GRID,
  SetEntitiesOutOfBoundariesAction,
  SET_ENTITIES_OUT_OF_BOUNDARIES,
  SetExportProgressAction,
  SET_EXPORT_PROGRESS,
  SET_EDITOR_LOADING,
  SetEditorLoadingAction,
  SetScreenshotReadyAction,
  SET_SCREENSHOT_READY,
  SetEditorReadOnlyAction,
  SET_EDITOR_READ_ONLY
} from './actions'
import { Gizmo } from './types'
import { DELETE_ITEM, DeleteItemAction } from 'modules/scene/actions'
import {
  EXPORT_PROJECT_SUCCESS,
  EXPORT_PROJECT_REQUEST,
  ExportProjectRequestAction,
  ExportProjectSuccessAction
} from 'modules/project/actions'

export type EditorState = {
  gizmo: Gizmo
  preview: boolean
  sidebar: boolean
  snapToGrid: boolean
  selectedEntityId: string | null
  entitiesOutOfBoundaries: string[]
  isReady: boolean // editor is ready to be interacted with via API
  isLoading: boolean // models are done loading
  isScreenshotReady: boolean
  isReadOnly: boolean
  export: {
    isLoading: boolean
    progress: number
    total: number
  }
}

const INITIAL_STATE: EditorState = {
  gizmo: Gizmo.NONE,
  preview: false,
  sidebar: true,
  snapToGrid: true,
  selectedEntityId: null,
  entitiesOutOfBoundaries: [],
  isReady: false,
  isLoading: false,
  isScreenshotReady: false,
  isReadOnly: false,
  export: {
    isLoading: false,
    progress: 0,
    total: 0
  }
}

export type EditorReducerAction =
  | SetGizmoAction
  | SetScreenshotReadyAction
  | TogglePreviewAction
  | ToggleSidebarAction
  | SelectEntityAction
  | DeselectEntityAction
  | SetEditorReadyAction
  | CloseEditorAction
  | ToggleSnapToGridAction
  | SetEntitiesOutOfBoundariesAction
  | DeleteItemAction
  | SetExportProgressAction
  | SetEditorLoadingAction
  | SetEditorReadOnlyAction
  | ExportProjectRequestAction
  | ExportProjectSuccessAction

export const editorReducer = (state = INITIAL_STATE, action: EditorReducerAction): EditorState => {
  switch (action.type) {
    case SET_GIZMO: {
      const { gizmo } = action.payload
      return {
        ...state,
        gizmo
      }
    }
    case TOGGLE_PREVIEW: {
      const { isEnabled: enabled } = action.payload
      return {
        ...state,
        preview: enabled
      }
    }
    case TOGGLE_SIDEBAR: {
      const { isEnabled: enabled } = action.payload
      return {
        ...state,
        sidebar: enabled
      }
    }
    case SELECT_ENTITY: {
      return {
        ...state,
        selectedEntityId: action.payload.entityId
      }
    }
    case DESELECT_ENTITY: {
      return {
        ...state,
        selectedEntityId: null
      }
    }
    case SET_EDITOR_READY: {
      const { isReady } = action.payload
      return {
        ...state,
        isLoading: isReady,
        isReady
      }
    }
    case CLOSE_EDITOR: {
      return {
        ...INITIAL_STATE
      }
    }
    case TOGGLE_SNAP_TO_GRID: {
      return {
        ...state,
        snapToGrid: action.payload.enabled
      }
    }
    case SET_ENTITIES_OUT_OF_BOUNDARIES: {
      return {
        ...state,
        entitiesOutOfBoundaries: action.payload.entities
      }
    }
    case DELETE_ITEM: {
      return {
        ...state,
        entitiesOutOfBoundaries: state.entitiesOutOfBoundaries.filter(entityId => entityId !== state.selectedEntityId)
      }
    }
    case EXPORT_PROJECT_REQUEST: {
      return {
        ...state,
        export: {
          ...state.export,
          isLoading: true
        }
      }
    }
    case SET_EXPORT_PROGRESS: {
      const { loaded, total } = action.payload
      return {
        ...state,
        export: {
          ...state.export,
          ...action.payload,
          progress: loaded,
          total
        }
      }
    }
    case EXPORT_PROJECT_SUCCESS: {
      return {
        ...state,
        export: {
          ...state.export,
          isLoading: false,
          progress: 0,
          total: 0
        }
      }
    }
    case SET_EDITOR_LOADING: {
      return {
        ...state,
        isLoading: action.payload.isLoading
      }
    }
    case SET_EDITOR_READ_ONLY: {
      return {
        ...state,
        isReadOnly: action.payload.isReadOnly
      }
    }
    case SET_SCREENSHOT_READY: {
      return {
        ...state,
        isScreenshotReady: action.payload.isScreenshotReady
      }
    }
    default:
      return state
  }
}
