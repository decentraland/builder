import {
  SetModeAction,
  TogglePreviewAction,
  ToggleSidebarAction,
  SET_GIZMO,
  TOGGLE_PREVIEW,
  TOGGLE_SIDEBAR,
  SelectEntityAction,
  SELECT_ENTITY,
  UnselectEntityAction,
  UNSELECT_ENTITY,
  SET_EDITOR_READY,
  CLOSE_EDITOR,
  SetEditorReadyAction,
  CloseEditorAction
} from './actions'
import { Gizmo } from './types'

export type EditorState = {
  gizmo: Gizmo
  preview: boolean
  sidebar: boolean
  selectedEntityId: string | null
  isReady: boolean
}

const INITIAL_STATE: EditorState = {
  gizmo: Gizmo.MOVE,
  preview: false,
  sidebar: true,
  selectedEntityId: null,
  isReady: false
}

export type EditorReducerAction =
  | SetModeAction
  | TogglePreviewAction
  | ToggleSidebarAction
  | SelectEntityAction
  | UnselectEntityAction
  | SetEditorReadyAction
  | CloseEditorAction

export const editorReducer = (state = INITIAL_STATE, action: EditorReducerAction): EditorState => {
  switch (action.type) {
    case SET_GIZMO: {
      const { gizmo: mode } = action.payload
      return {
        ...state,
        gizmo: mode
      }
    }
    case TOGGLE_PREVIEW: {
      const { enabled } = action.payload
      return {
        ...state,
        preview: enabled
      }
    }
    case TOGGLE_SIDEBAR: {
      const { enabled } = action.payload
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
    case UNSELECT_ENTITY: {
      return {
        ...state,
        selectedEntityId: null
      }
    }
    case SET_EDITOR_READY: {
      return {
        ...state,
        isReady: true
      }
    }
    case CLOSE_EDITOR: {
      return {
        ...INITIAL_STATE
      }
    }
    default:
      return state
  }
}
