import { Dispatch } from 'redux'

import { loadAssetPacksRequest, LoadAssetPacksRequestAction } from 'modules/assetPack/actions'
import {
  startEditor,
  bindEditorKeyboardShortcuts,
  unbindEditorKeyboardShortcuts,
  StartEditorAction,
  BindEditorKeybardShortcutsAction,
  UnbindEditorKeybardShortcutsAction
} from 'modules/editor/actions'

export type Props = {
  onStartEditor: typeof startEditor
  onLoadAssetPacks: typeof loadAssetPacksRequest
  onBindKeyboardShortcuts: typeof bindEditorKeyboardShortcuts
  onUnbindKeyboardShortcuts: typeof unbindEditorKeyboardShortcuts
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onStartEditor' | 'onLoadAssetPacks' | 'onBindKeyboardShortcuts' | 'onUnbindKeyboardShortcuts'>
export type MapDispatch = Dispatch<
  StartEditorAction | LoadAssetPacksRequestAction | BindEditorKeybardShortcutsAction | UnbindEditorKeybardShortcutsAction
>
