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
  SET_EXPORT_PROGRESS
} from './actions'
import { Gizmo } from './types'
import { DELETE_ITEM, DeleteItemAction } from 'modules/scene/actions'

export type EditorState = {
  gizmo: Gizmo
  preview: boolean
  sidebar: boolean
  snapToGrid: boolean
  selectedEntityId: string | null
  entitiesOutOfBoundaries: string[]
  isReady: boolean
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
  export: {
    isLoading: false,
    progress: 0,
    total: 0
  }
}

export type EditorReducerAction =
  | SetGizmoAction
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
    case SET_EXPORT_PROGRESS: {
      return {
        ...state,
        export: {
          ...state.export,
          ...action.payload
        }
      }
    }
    default:
      return state
  }
}
