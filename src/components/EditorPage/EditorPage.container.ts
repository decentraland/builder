import { connect } from 'react-redux'

import { getCurrentProject } from 'modules/project/selectors'
import { loadAssetPacksRequest } from 'modules/assetPack/actions'
import { RootState } from 'modules/common/types'
import { closeEditor, zoomIn, zoomOut, resetCamera } from 'modules/editor/actions'
import { isSidebarOpen, isPreviewing, isReady, isFetching } from 'modules/editor/selectors'
import { loadCollectiblesRequest } from 'modules/asset/actions'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'
import { isLoggedIn } from 'modules/auth/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isSidebarOpen: isSidebarOpen(state),
  isLoading: !isReady(state),
  isFetching: isFetching(state),
  isLoggedIn: isLoggedIn(state),
  currentProject: getCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: name => dispatch(openModal(name)),
  onLoadAssetPacks: () => dispatch(loadAssetPacksRequest()),
  onLoadCollectibles: () => dispatch(loadCollectiblesRequest()),
  onCloseEditor: () => dispatch(closeEditor()),
  onZoomIn: () => dispatch(zoomIn()),
  onZoomOut: () => dispatch(zoomOut()),
  onResetCamera: () => dispatch(resetCamera())
})

export default connect(
  mapState,
  mapDispatch
)(EditorPage)
