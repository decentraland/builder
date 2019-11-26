import { Dispatch } from 'redux'

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
import { Project } from 'modules/project/types'
import { Gizmo } from 'modules/editor/types'
import { PoolGroup } from 'modules/poolGroup/types'

export type Props = {
  gizmo: Gizmo
  metrics: SceneMetrics
  currentProject: Project | null
  currentPoolGroup: PoolGroup | null
  selectedEntityId: string | null
  isLoading: boolean
  isPreviewing: boolean
  isUploading: boolean
  isSidebarOpen: boolean
  enabledTools: Record<string, boolean>
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
  | 'currentPoolGroup'
  | 'metrics'
  | 'isLoading'
  | 'isPreviewing'
  | 'isUploading'
  | 'isSidebarOpen'
  | 'selectedEntityId'
  | 'enabledTools'
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
