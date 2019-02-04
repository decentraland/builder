import {
  SetModeAction,
  TogglePreviewAction,
  ToggleSidebarAction,
  SET_MODE,
  TOGGLE_PREVIEW,
  TOGGLE_SIDEBAR,
  SelectEntityAction,
  SELECT_ENTITY,
  UnselectEntityAction,
  UNSELECT_ENTITY,
  EDITOR_READY,
  CLOSE_EDITOR,
  EditorReadyAction,
  CloseEditorAction
} from './actions'
import { EditorMode } from './types'

export type EditorState = {
  mode: EditorMode
  preview: boolean
  sidebar: boolean
  selectedEntityId: string | null
  isReady: boolean
}

const INITIAL_STATE: EditorState = {
  mode: 'move',
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
  | EditorReadyAction
  | CloseEditorAction

export const editorReducer = (state = INITIAL_STATE, action: EditorReducerAction): EditorState => {
  switch (action.type) {
    case SET_MODE: {
      const { mode } = action.payload
      return {
        ...state,
        mode
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

    case EDITOR_READY: {
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
