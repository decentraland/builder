import { connect } from 'react-redux'
import { goBack } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentMetrics } from 'modules/scene/selectors'
import { isSavingCurrentProject } from 'modules/sync/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopBar.types'
import TopBar from './TopBar'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state),
  metrics: getCurrentMetrics(state),
  isUploading: isSavingCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onBack: () => dispatch(goBack()),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(TopBar)
