import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getGizmo, isPreviewing, isSidebarOpen, getSelectedEntityId } from 'modules/editor/selectors'
import { openModal } from 'modules/modal/actions'
import { hasSubmittedCurrentProject, hasAcceptedTerms } from 'modules/contest/selectors'
import { setGizmo, togglePreview, toggleSidebar } from 'modules/editor/actions'
import { resetItem, duplicateItem, deleteItem } from 'modules/scene/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopBar.types'
import TopBar from './TopBar'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state),
  hasAcceptedTerms: hasAcceptedTerms(state),
  hasSubmittedCurrentProject: hasSubmittedCurrentProject(state),
  gizmo: getGizmo(state),
  isPreviewing: isPreviewing(state),
  isSidebarOpen: isSidebarOpen(state),
  selectedEntityId: getSelectedEntityId(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetGizmo: gizmo => dispatch(setGizmo(gizmo)),
  onTogglePreview: enabled => dispatch(togglePreview(enabled)),
  onToggleSidebar: enabled => dispatch(toggleSidebar(enabled)),
  onReset: () => dispatch(resetItem()),
  onDuplicate: () => dispatch(duplicateItem()),
  onDelete: () => dispatch(deleteItem()),
  onOpenModal: name => dispatch(openModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(TopBar)
