import { Dispatch } from 'redux'
import {
  closeEditor,
  CloseEditorAction,
  BindEditorKeybardShortcutsAction,
  UnbindEditorKeybardShortcutsAction,
  zoomIn,
  zoomOut,
  resetCamera,
  ZoomInAction,
  ZoomOutAction,
  ResetCameraAction
} from 'modules/editor/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Project } from 'modules/project/types'

export type Props = {
  currentProject: Project | null
  isSidebarOpen: boolean
  isPreviewing: boolean
  isFetching: boolean
  isLoading: boolean
  isLoggedIn: boolean
  numItems: number
  onOpenModal: typeof openModal
  onCloseEditor: typeof closeEditor
  onZoomIn: typeof zoomIn
  onZoomOut: typeof zoomOut
  onResetCamera: typeof resetCamera
}

export type State = {
  isIncentiveBannerOpen: boolean
}

export type MapStateProps = Pick<
  Props,
  'isSidebarOpen' | 'isPreviewing' | 'isLoading' | 'isFetching' | 'isLoggedIn' | 'currentProject' | 'numItems'
>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onCloseEditor' | 'onZoomOut' | 'onZoomIn' | 'onResetCamera'>
export type MapDispatch = Dispatch<
  | OpenModalAction
  | BindEditorKeybardShortcutsAction
  | UnbindEditorKeybardShortcutsAction
  | CloseEditorAction
  | ZoomInAction
  | ZoomOutAction
  | ResetCameraAction
>
