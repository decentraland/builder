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
import { SceneMetrics } from 'modules/scene/types'

export type Props = {
  gizmo: Gizmo
  currentProject: Project | null
  metrics: SceneMetrics
  limits: SceneMetrics
  selectedEntityId: string | null
  isLoading: boolean
  isPreviewing: boolean
  isSidebarOpen: boolean
  hasAcceptedTerms: boolean
  hasSubmittedCurrentProject: boolean
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
  | 'gizmo'
  | 'currentProject'
  | 'metrics'
  | 'limits'
  | 'isLoading'
  | 'isPreviewing'
  | 'isSidebarOpen'
  | 'selectedEntityId'
  | 'hasAcceptedTerms'
  | 'hasSubmittedCurrentProject'
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
