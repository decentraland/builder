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
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Project } from 'modules/project/types'
import { Gizmo } from 'modules/editor/types'
import { PoolGroup } from 'modules/poolGroup/types'

export type Props = {
  gizmo: Gizmo
  currentProject: Project | null
  currentPoolGroup: PoolGroup | null
  selectedEntityIds: string[]
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
  hasHistory: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'gizmo'
  | 'currentProject'
  | 'currentPoolGroup'
  | 'isLoading'
  | 'isPreviewing'
  | 'isUploading'
  | 'isSidebarOpen'
  | 'selectedEntityIds'
  | 'enabledTools'
  | 'hasHistory'
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
