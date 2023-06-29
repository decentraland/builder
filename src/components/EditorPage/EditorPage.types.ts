import { Dispatch } from 'redux'
import {
  closeEditor,
  CloseEditorAction,
  BindEditorKeybardShortcutsAction,
  UnbindEditorKeybardShortcutsAction,
  zoomIn,
  zoomOut,
  resetCamera,
  takeScreenshot,
  ZoomInAction,
  ZoomOutAction,
  ResetCameraAction,
  TakeScreenshotAction
} from 'modules/editor/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Project } from 'modules/project/types'

export type Props = {
  currentProject: Project | null
  isSidebarOpen: boolean
  isPreviewing: boolean
  isFetching: boolean
  isReady: boolean
  isLoading: boolean
  isLoggedIn: boolean
  isScreenshotReady: boolean
  numItems: number
  isFromClaimName: boolean
  claimedName?: string
  onOpenModal: typeof openModal
  onCloseEditor: typeof closeEditor
  onZoomIn: typeof zoomIn
  onZoomOut: typeof zoomOut
  onResetCamera: typeof resetCamera
  onTakeScreenshot: typeof takeScreenshot
}

export type State = {
  isIncentiveBannerOpen: boolean
  isDeployModalOpened: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'isSidebarOpen'
  | 'isPreviewing'
  | 'isReady'
  | 'isLoading'
  | 'isFetching'
  | 'isLoggedIn'
  | 'isScreenshotReady'
  | 'currentProject'
  | 'numItems'
  | 'isFromClaimName'
  | 'claimedName'
>
export type MapDispatchProps = Pick<
  Props,
  'onOpenModal' | 'onCloseEditor' | 'onZoomOut' | 'onZoomIn' | 'onResetCamera' | 'onTakeScreenshot'
>
export type MapDispatch = Dispatch<
  | OpenModalAction
  | BindEditorKeybardShortcutsAction
  | UnbindEditorKeybardShortcutsAction
  | CloseEditorAction
  | ZoomInAction
  | ZoomOutAction
  | ResetCameraAction
  | TakeScreenshotAction
>
