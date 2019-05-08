import { Dispatch } from 'redux'

import { loadAssetPacksRequest, LoadAssetPacksRequestAction } from 'modules/assetPack/actions'
import { loadCollectiblesRequest, LoadCollectiblesRequestAction } from 'modules/asset/actions'
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
  isLoading: boolean
  onOpenModal: typeof openModal
  onLoadAssetPacks: typeof loadAssetPacksRequest
  onLoadCollectibles: typeof loadCollectiblesRequest
  onCloseEditor: typeof closeEditor
  onZoomIn: typeof zoomIn
  onZoomOut: typeof zoomOut
  onResetCamera: typeof resetCamera
}

export type State = {
  isIncentiveBannerOpen: boolean
}

export type MapStateProps = Pick<Props, 'isSidebarOpen' | 'isPreviewing' | 'isLoading' | 'currentProject'>
export type MapDispatchProps = Pick<
  Props,
  'onOpenModal' | 'onLoadAssetPacks' | 'onCloseEditor' | 'onZoomOut' | 'onZoomIn' | 'onResetCamera' | 'onLoadCollectibles'
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
  | LoadCollectiblesRequestAction
>
