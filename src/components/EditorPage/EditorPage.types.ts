import { Dispatch } from 'redux'

import { loadAssetPacksRequest, LoadAssetPacksRequestAction } from 'modules/assetPack/actions'
import {
  bindEditorKeyboardShortcuts,
  unbindEditorKeyboardShortcuts,
  startEditor,
  BindEditorKeybardShortcutsAction,
  UnbindEditorKeybardShortcutsAction,
  StartEditorAction
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
  LoadAssetPacksRequestAction | StartEditorAction | BindEditorKeybardShortcutsAction | UnbindEditorKeybardShortcutsAction
>
