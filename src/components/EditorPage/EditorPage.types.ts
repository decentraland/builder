import { Dispatch } from 'redux'

import { loadAssetPacksRequest, LoadAssetPacksRequestAction } from 'modules/assetPack/actions'
import {
  closeEditor,
  bindEditorKeyboardShortcuts,
  unbindEditorKeyboardShortcuts,
  CloseEditorAction,
  BindEditorKeybardShortcutsAction,
  UnbindEditorKeybardShortcutsAction
} from 'modules/editor/actions'

export type Props = {
  onLoadAssetPacks: typeof loadAssetPacksRequest
  onBindKeyboardShortcuts: typeof bindEditorKeyboardShortcuts
  onUnbindKeyboardShortcuts: typeof unbindEditorKeyboardShortcuts
  onCloseEditor: typeof closeEditor
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onLoadAssetPacks' | 'onBindKeyboardShortcuts' | 'onUnbindKeyboardShortcuts' | 'onCloseEditor'>
export type MapDispatch = Dispatch<
  LoadAssetPacksRequestAction | BindEditorKeybardShortcutsAction | UnbindEditorKeybardShortcutsAction | CloseEditorAction
>
