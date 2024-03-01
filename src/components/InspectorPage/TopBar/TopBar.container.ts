import { connect } from 'react-redux'
import { goBack } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getCurrentProject } from 'modules/project/selectors'
import { getCurrentLimits, getCurrentMetrics, getEntitiesOutOfBoundaries } from 'modules/scene/selectors'
import { isSavingCurrentProject } from 'modules/sync/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopBar.types'
import TopBar from './TopBar'
import { SceneMetrics } from '@dcl/inspector/dist/redux/scene-metrics/types'

const mapState = (state: RootState): MapStateProps => ({
  currentProject: getCurrentProject(state),
  metrics: getCurrentMetrics(state) as SceneMetrics,
  limits: getCurrentLimits(state) as SceneMetrics,
  areEntitiesOutOfBoundaries: getEntitiesOutOfBoundaries(state) > 0,
  isUploading: isSavingCurrentProject(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onBack: () => dispatch(goBack()),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(TopBar)
