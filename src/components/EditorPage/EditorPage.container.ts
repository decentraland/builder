import { connect } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { loadAssetPacksRequest } from 'modules/assetPack/actions'
import { RootState } from 'modules/common/types'
import { bindEditorKeyboardShortcuts, unbindEditorKeyboardShortcuts, closeEditor } from 'modules/editor/actions'
import { isSidebarOpen, isPreviewing } from 'modules/editor/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isSidebarOpen: isSidebarOpen(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name: string) => dispatch(openModal(name)),
  onLoadAssetPacks: () => dispatch(loadAssetPacksRequest()),
  onBindKeyboardShortcuts: () => dispatch(bindEditorKeyboardShortcuts()),
  onUnbindKeyboardShortcuts: () => dispatch(unbindEditorKeyboardShortcuts()),
  onCloseEditor: () => dispatch(closeEditor())
})

export default connect(
  mapState,
  mapDispatch
)(EditorPage)
