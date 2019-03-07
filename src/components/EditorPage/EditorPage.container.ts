import { connect } from 'react-redux'

import { getCurrentProject } from 'modules/project/selectors'
import { loadAssetPacksRequest } from 'modules/assetPack/actions'
import { RootState } from 'modules/common/types'
import {
  bindEditorKeyboardShortcuts,
  unbindEditorKeyboardShortcuts,
  closeEditor,
  zoomIn,
  zoomOut,
  resetCamera
} from 'modules/editor/actions'
import { isSidebarOpen, isPreviewing, isReady } from 'modules/editor/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isSidebarOpen: isSidebarOpen(state),
  isLoading: isReady(state),
  currentProject: getCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: name => dispatch(openModal(name)),
  onLoadAssetPacks: () => dispatch(loadAssetPacksRequest()),
  onBindKeyboardShortcuts: () => dispatch(bindEditorKeyboardShortcuts()),
  onUnbindKeyboardShortcuts: () => dispatch(unbindEditorKeyboardShortcuts()),
  onCloseEditor: () => dispatch(closeEditor()),
  onZoomIn: () => dispatch(zoomIn()),
  onZoomOut: () => dispatch(zoomOut()),
  onResetCamera: () => dispatch(resetCamera())
})

export default connect(
  mapState,
  mapDispatch
)(EditorPage)
