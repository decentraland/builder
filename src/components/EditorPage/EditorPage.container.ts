import { connect } from 'react-redux'

import { getCurrentProject } from 'modules/project/selectors'
import { RootState } from 'modules/common/types'
import { closeEditor, zoomIn, zoomOut, resetCamera } from 'modules/editor/actions'
import { isSidebarOpen, isPreviewing, isReady, isFetching } from 'modules/editor/selectors'
import { openModal } from 'modules/modal/actions'
import { numItems } from 'modules/scene/selectors'
import { isLoggedIn } from 'modules/auth/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state),
  isSidebarOpen: isSidebarOpen(state),
  isLoading: !isReady(state),
  isFetching: isFetching(state),
  isLoggedIn: isLoggedIn(state),
  currentProject: getCurrentProject(state),
  numItems: numItems(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: name => dispatch(openModal(name)),
  onCloseEditor: () => dispatch(closeEditor()),
  onZoomIn: () => dispatch(zoomIn()),
  onZoomOut: () => dispatch(zoomOut()),
  onResetCamera: () => dispatch(resetCamera())
})

export default connect(mapState, mapDispatch)(EditorPage)
