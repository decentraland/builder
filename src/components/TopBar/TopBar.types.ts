import { Project } from 'modules/project/types'
import { EditorMode } from 'modules/editor/types'
import {
  setMode,
  togglePreview,
  toggleSidebar,
  SetModeAction,
  TogglePreviewAction,
  ToggleSidebarAction,
  editorUndo,
  EditorUndoAction
} from 'modules/editor/actions'
import { Dispatch } from 'redux'

export type Props = {
  currentProject?: Project
  mode: EditorMode
  isPreviewing: boolean
  isSidebarOpen: boolean
  hasHistory: boolean
  selectedEntityId: string | null
  onSetMode: typeof setMode
  onTogglePreview: typeof togglePreview
  onToggleSidebar: typeof toggleSidebar
  onUndo: typeof editorUndo
}

export type MapStateProps = Pick<Props, 'currentProject' | 'mode' | 'isPreviewing' | 'isSidebarOpen' | 'selectedEntityId' | 'hasHistory'>
export type MapDispatchProps = Pick<Props, 'onSetMode' | 'onTogglePreview' | 'onToggleSidebar' | 'onUndo'>
export type MapDispatch = Dispatch<SetModeAction | TogglePreviewAction | ToggleSidebarAction | EditorUndoAction>
