import { connect } from 'react-redux'

import { loadAssetPacksRequest, LoadAssetPacksRequestAction } from 'modules/assetPack/actions'
import {
  bindEditorKeyboardShortcuts,
  unbindEditorKeyboardShortcuts,
  BindEditorKeybardShortcuts,
  UnbindEditorKeybardShortcuts
} from 'modules/editor/actions'
import { MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'
import { Dispatch } from 'redux'

const mapState = () => ({})

const mapDispatch = (
  dispatch: Dispatch<LoadAssetPacksRequestAction | BindEditorKeybardShortcuts | UnbindEditorKeybardShortcuts>
): MapDispatchProps => ({
  onLoadAssetPacks: () => dispatch(loadAssetPacksRequest()),
  onBindKeyboardShortcuts: () => dispatch(bindEditorKeyboardShortcuts()),
  onUnbindKeyboardShortcuts: () => dispatch(unbindEditorKeyboardShortcuts())
})

export default connect(
  mapState,
  mapDispatch
)(EditorPage)
