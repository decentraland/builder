import { connect } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getEditorMode, isPreviewing, isSidebarOpen, getSelectedEntityId } from 'modules/editor/selectors'
import { setMode, togglePreview, toggleSidebar, editorUndo } from 'modules/editor/actions'
import { hasHistory } from 'modules/scene/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopBar.types'
import TopBar from './TopBar'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state),
  mode: getEditorMode(state),
  isPreviewing: isPreviewing(state),
  isSidebarOpen: isSidebarOpen(state),
  hasHistory: hasHistory(state),
  selectedEntityId: getSelectedEntityId(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetMode: mode => dispatch(setMode(mode)),
  onTogglePreview: enabled => dispatch(togglePreview(enabled)),
  onToggleSidebar: enabled => dispatch(toggleSidebar(enabled)),
  onUndo: () => dispatch(editorUndo()),
  onOpenModal: (name: string) => dispatch(openModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(TopBar)
