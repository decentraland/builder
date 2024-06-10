import { connect } from 'react-redux'
import { getCurrentProject } from 'modules/project/selectors'
import { RootState } from 'modules/common/types'
import { closeEditor, zoomIn, zoomOut, resetCamera, takeScreenshot } from 'modules/editor/actions'
import { isSidebarOpen, isPreviewing, isReady, isFetching, isLoading, isScreenshotReady } from 'modules/editor/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { numItems } from 'modules/scene/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'

const mapState = (state: RootState): MapStateProps => {
  return {
    isPreviewing: isPreviewing(state),
    isSidebarOpen: isSidebarOpen(state),
    isReady: isReady(state),
    isLoading: isLoading(state),
    isFetching: isFetching(state),
    isLoggedIn: isLoggedIn(state),
    isScreenshotReady: isScreenshotReady(state),
    currentProject: getCurrentProject(state),
    numItems: numItems(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onCloseEditor: () => dispatch(closeEditor()),
  onZoomIn: () => dispatch(zoomIn()),
  onZoomOut: () => dispatch(zoomOut()),
  onResetCamera: () => dispatch(resetCamera()),
  onTakeScreenshot: () => dispatch(takeScreenshot())
})

export default connect(mapState, mapDispatch)(EditorPage)
