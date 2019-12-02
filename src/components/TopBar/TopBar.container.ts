import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getActivePoolGroup } from 'modules/poolGroup/selectors'
import { getGizmo, isPreviewing, isSidebarOpen, getSelectedEntityId, isLoading, isReady, getEnabledTools } from 'modules/editor/selectors'
import { openModal } from 'modules/modal/actions'
import { setGizmo, togglePreview, toggleSidebar } from 'modules/editor/actions'
import { resetItem, duplicateItem, deleteItem } from 'modules/scene/actions'
import { getCurrentMetrics } from 'modules/scene/selectors'
import { isSavingCurrentProject } from 'modules/sync/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopBar.types'
import TopBar from './TopBar'

const mapState = (state: RootState): MapStateProps => {
  const selectedEntityId = getSelectedEntityId(state)
  return {
    gizmo: getGizmo(state),
    currentProject: getCurrentProject(state),
    currentPoolGroup: getActivePoolGroup(state),
    metrics: getCurrentMetrics(state),
    selectedEntityId,
    isLoading: !isReady(state) || isLoading(state),
    isPreviewing: isPreviewing(state),
    isUploading: isSavingCurrentProject(state),
    isSidebarOpen: isSidebarOpen(state),
    enabledTools: getEnabledTools(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetGizmo: gizmo => dispatch(setGizmo(gizmo)),
  onTogglePreview: enabled => dispatch(togglePreview(enabled)),
  onToggleSidebar: enabled => dispatch(toggleSidebar(enabled)),
  onReset: () => dispatch(resetItem()),
  onDuplicate: () => dispatch(duplicateItem()),
  onDelete: () => dispatch(deleteItem()),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(
  mapState,
  mapDispatch
)(TopBar)
