import { Dispatch } from 'redux'

import { loadAssetPacksRequest, LoadAssetPacksRequestAction } from 'modules/assetPack/actions'
import {
  closeEditor,
  bindEditorKeyboardShortcuts,
  unbindEditorKeyboardShortcuts,
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
import { navigateTo, NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

export type Props = {
  project: Project | null
  isSidebarOpen: boolean
  isPreviewing: boolean
  onOpenModal: typeof openModal
  onLoadAssetPacks: typeof loadAssetPacksRequest
  onBindKeyboardShortcuts: typeof bindEditorKeyboardShortcuts
  onUnbindKeyboardShortcuts: typeof unbindEditorKeyboardShortcuts
  onCloseEditor: typeof closeEditor
  onZoomIn: typeof zoomIn
  onZoomOut: typeof zoomOut
  onResetCamera: typeof resetCamera
  onNavigate: typeof navigateTo
}

export type MapStateProps = Pick<Props, 'isSidebarOpen' | 'isPreviewing' | 'project'>
export type MapDispatchProps = Pick<
  Props,
  | 'onOpenModal'
  | 'onLoadAssetPacks'
  | 'onBindKeyboardShortcuts'
  | 'onUnbindKeyboardShortcuts'
  | 'onCloseEditor'
  | 'onZoomOut'
  | 'onZoomIn'
  | 'onResetCamera'
  | 'onNavigate'
>
export type MapDispatch = Dispatch<
  | OpenModalAction
  | LoadAssetPacksRequestAction
  | BindEditorKeybardShortcutsAction
  | UnbindEditorKeybardShortcutsAction
  | CloseEditorAction
  | ZoomInAction
  | ZoomOutAction
  | ResetCameraAction
  | NavigateToAction
>
