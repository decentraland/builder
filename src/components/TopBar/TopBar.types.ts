import { Dispatch } from 'redux'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

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
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'currentProject' | 'mode' | 'isPreviewing' | 'isSidebarOpen' | 'selectedEntityId' | 'hasHistory'>
export type MapDispatchProps = Pick<Props, 'onSetMode' | 'onTogglePreview' | 'onToggleSidebar' | 'onUndo' | 'onOpenModal'>
export type MapDispatch = Dispatch<SetModeAction | TogglePreviewAction | ToggleSidebarAction | EditorUndoAction | OpenModalAction>
