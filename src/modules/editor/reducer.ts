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
  TOGGLE_SNAP_TO_GRID
} from './actions'
import { Gizmo } from './types'

export type EditorState = {
  gizmo: Gizmo
  preview: boolean
  sidebar: boolean
  snapToGrid: boolean
  selectedEntityId: string | null
  isReady: boolean
}

const INITIAL_STATE: EditorState = {
  gizmo: Gizmo.NONE,
  preview: false,
  sidebar: true,
  snapToGrid: true,
  selectedEntityId: null,
  isReady: false
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
    default:
      return state
  }
}
