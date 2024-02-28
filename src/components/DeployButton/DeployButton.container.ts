import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getCurrentDeploymentStatus } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './DeployButton.types'
import DeployButton from './DeployButton'
import { getCurrentLimits, getCurrentMetrics } from 'modules/scene/selectors'
import { isReady, isLoading, areEntitiesOutOfBoundaries } from 'modules/editor/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { ModelMetrics } from 'modules/models/types'

const mapState = (state: RootState): MapStateProps => ({
  project: getCurrentProject(state)!,
  limits: getCurrentLimits(state) as ModelMetrics,
  metrics: getCurrentMetrics(state) as ModelMetrics,
  isLoading: !isReady(state) || isLoading(state),
  areEntitiesOutOfBoundaries: areEntitiesOutOfBoundaries(state),
  deploymentStatus: getCurrentDeploymentStatus(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(DeployButton)
