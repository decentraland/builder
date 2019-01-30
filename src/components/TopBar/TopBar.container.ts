import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopBar.types'
import TopBar from './TopBar'
import { getEditorMode, isPreviewing, isSidebarOpen, getSelectedEntityId } from 'modules/editor/selectors'
import { setMode, togglePreview, toggleSidebar, editorUndo } from 'modules/editor/actions'
import { hasHistory } from 'modules/scene/selectors'

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
  onUndo: () => dispatch(editorUndo())
})

export default connect(
  mapState,
  mapDispatch
)(TopBar)
