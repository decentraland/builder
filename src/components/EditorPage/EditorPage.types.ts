import { loadAssetPacksRequest } from 'modules/assetPack/actions'
import { bindEditorKeyboardShortcuts, unbindEditorKeyboardShortcuts } from 'modules/editor/actions'

export type Props = {
  onLoadAssetPacks: typeof loadAssetPacksRequest
  onBindKeyboardShortcuts: typeof bindEditorKeyboardShortcuts
  onUnbindKeyboardShortcuts: typeof unbindEditorKeyboardShortcuts
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onLoadAssetPacks' | 'onBindKeyboardShortcuts' | 'onUnbindKeyboardShortcuts'>
