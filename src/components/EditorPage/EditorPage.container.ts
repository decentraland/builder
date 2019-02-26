import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

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
import { isSidebarOpen, isPreviewing } from 'modules/editor/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isSidebarOpen: isSidebarOpen(state),
  project: getCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: name => dispatch(openModal(name)),
  onLoadAssetPacks: () => dispatch(loadAssetPacksRequest()),
  onBindKeyboardShortcuts: () => dispatch(bindEditorKeyboardShortcuts()),
  onUnbindKeyboardShortcuts: () => dispatch(unbindEditorKeyboardShortcuts()),
  onCloseEditor: () => dispatch(closeEditor()),
  onZoomIn: () => dispatch(zoomIn()),
  onZoomOut: () => dispatch(zoomOut()),
  onResetCamera: () => dispatch(resetCamera()),
  onNavigate: (path: string) => dispatch(navigateTo(path))
})

export default connect(
  mapState,
  mapDispatch
)(EditorPage)
