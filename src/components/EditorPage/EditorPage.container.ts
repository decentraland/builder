import { connect } from 'react-redux'

import { loadAssetPacksRequest } from 'modules/assetPack/actions'
import { RootState } from 'modules/common/types'
import { bindEditorKeyboardShortcuts, unbindEditorKeyboardShortcuts, startEditor, closeEditor } from 'modules/editor/actions'
import { isSidebarOpen, isPreviewing } from 'modules/editor/selectors'
import EditorPage from './EditorPage'
import { MapStateProps, MapDispatch, MapDispatchProps } from './EditorPage.types'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isSidebarOpen: isSidebarOpen(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onStartEditor: () => dispatch(startEditor()),
  onLoadAssetPacks: () => dispatch(loadAssetPacksRequest()),
  onBindKeyboardShortcuts: () => dispatch(bindEditorKeyboardShortcuts()),
  onUnbindKeyboardShortcuts: () => dispatch(unbindEditorKeyboardShortcuts()),
  onCloseEditor: () => dispatch(closeEditor())
})

export default connect(
  mapState,
  mapDispatch
)(EditorPage)
