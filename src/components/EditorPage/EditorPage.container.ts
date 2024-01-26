import { connect } from 'react-redux'
import { getLocation } from 'connected-react-router'
import { getCurrentProject } from 'modules/project/selectors'
import { RootState } from 'modules/common/types'
import { closeEditor, zoomIn, zoomOut, resetCamera, takeScreenshot } from 'modules/editor/actions'
import { isSidebarOpen, isPreviewing, isReady, isFetching, isLoading, isScreenshotReady } from 'modules/editor/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { numItems } from 'modules/scene/selectors'
import { ClaimNameLocationStateProps, FromParam } from 'modules/location/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './EditorPage.types'
import EditorPage from './EditorPage'

const mapState = (state: RootState): MapStateProps => {
  let claimedName = undefined
  const isFromClaimName = (getLocation(state).state as ClaimNameLocationStateProps)?.fromParam === FromParam.CLAIM_NAME
  if (isFromClaimName) {
    claimedName = (getLocation(state).state as ClaimNameLocationStateProps).claimedName
  }
  return {
    isPreviewing: isPreviewing(state),
    isSidebarOpen: isSidebarOpen(state),
    isReady: isReady(state),
    isLoading: isLoading(state),
    isFetching: isFetching(state),
    isLoggedIn: isLoggedIn(state),
    isScreenshotReady: isScreenshotReady(state),
    currentProject: getCurrentProject(state),
    numItems: numItems(state),
    isFromClaimName,
    claimedName
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
