import { Dispatch } from 'redux'

import { loadAssetPacksRequest, LoadAssetPacksRequestAction } from 'modules/assetPack/actions'
import {
  startEditor,
  closeEditor,
  bindEditorKeyboardShortcuts,
  unbindEditorKeyboardShortcuts,
  StartEditorAction,
  CloseEditorAction,
  BindEditorKeybardShortcutsAction,
  UnbindEditorKeybardShortcutsAction
} from 'modules/editor/actions'

export type Props = {
  isSidebarOpen: boolean
  isPreviewing: boolean
  onStartEditor: typeof startEditor
  onLoadAssetPacks: typeof loadAssetPacksRequest
  onBindKeyboardShortcuts: typeof bindEditorKeyboardShortcuts
  onUnbindKeyboardShortcuts: typeof unbindEditorKeyboardShortcuts
  onCloseEditor: typeof closeEditor
}

export type MapStateProps = Pick<Props, 'isSidebarOpen' | 'isPreviewing'>
export type MapDispatchProps = Pick<
  Props,
  'onStartEditor' | 'onLoadAssetPacks' | 'onBindKeyboardShortcuts' | 'onUnbindKeyboardShortcuts' | 'onCloseEditor'
>
export type MapDispatch = Dispatch<
  | LoadAssetPacksRequestAction
  | StartEditorAction
  | BindEditorKeybardShortcutsAction
  | UnbindEditorKeybardShortcutsAction
  | CloseEditorAction
>
