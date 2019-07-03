import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import {
  getGizmo,
  isPreviewing,
  isSidebarOpen,
  getSelectedEntityId,
  isLoading,
  areEntitiesOutOfBoundaries,
  isReady,
  getEnabledTools
} from 'modules/editor/selectors'
import { openModal } from 'modules/modal/actions'
import { setGizmo, togglePreview, toggleSidebar } from 'modules/editor/actions'
import { resetItem, duplicateItem, deleteItem } from 'modules/scene/actions'
import { getCurrentMetrics, getCurrentLimits } from 'modules/scene/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopBar.types'
import TopBar from './TopBar'

const mapState = (state: RootState): MapStateProps => {
  const selectedEntityId = getSelectedEntityId(state)
  return {
    gizmo: getGizmo(state),
    currentProject: getCurrentProject(state),
    limits: getCurrentLimits(state),
    metrics: getCurrentMetrics(state),
    selectedEntityId,
    isLoading: !isReady(state) || isLoading(state),
    isPreviewing: isPreviewing(state),
    isSidebarOpen: isSidebarOpen(state),
    enabledTools: getEnabledTools(selectedEntityId)(state),
    areEntitiesOutOfBoundaries: areEntitiesOutOfBoundaries(state)
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
