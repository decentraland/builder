import { Dispatch } from 'redux'

import { Project } from 'modules/project/types'
import { Gizmo } from 'modules/editor/types'
import {
  setGizmo,
  togglePreview,
  toggleSidebar,
  SetGizmoAction,
  TogglePreviewAction,
  ToggleSidebarAction,
  EditorUndoAction
} from 'modules/editor/actions'
import { resetItem, duplicateItem, deleteItem, ResetItemAction, DuplicateItemAction, DeleteItemAction } from 'modules/scene/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  currentProject: Project | null
  hasAcceptedTerms: boolean
  hasSubmittedCurrentProject: boolean
  gizmo: Gizmo
  isPreviewing: boolean
  isSidebarOpen: boolean
  selectedEntityId: string | null
  onSetGizmo: typeof setGizmo
  onTogglePreview: typeof togglePreview
  onToggleSidebar: typeof toggleSidebar
  onReset: typeof resetItem
  onDuplicate: typeof duplicateItem
  onDelete: typeof deleteItem
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<
  Props,
  'currentProject' | 'gizmo' | 'isPreviewing' | 'isSidebarOpen' | 'selectedEntityId' | 'hasAcceptedTerms' | 'hasSubmittedCurrentProject'
>

export type MapDispatchProps = Pick<
  Props,
  'onSetGizmo' | 'onTogglePreview' | 'onToggleSidebar' | 'onReset' | 'onDuplicate' | 'onDelete' | 'onOpenModal'
>
export type MapDispatch = Dispatch<
  | SetGizmoAction
  | TogglePreviewAction
  | ToggleSidebarAction
  | EditorUndoAction
  | ResetItemAction
  | DuplicateItemAction
  | DeleteItemAction
  | OpenModalAction
>
