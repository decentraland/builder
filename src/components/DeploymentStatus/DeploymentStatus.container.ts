import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { MapStateProps } from './DeploymentStatus.types'
import DeploymentStatus from './DeploymentStatus'
import { getCurrentDeploymentStatus, getCurrentDeployment } from 'modules/deployment/selectors'

const mapState = (state: RootState): MapStateProps => ({
  status: getCurrentDeploymentStatus(state),
  deployment: getCurrentDeployment(state)
})

const mapDispatch = () => ({})

export default connect(
  mapState,
  mapDispatch
)(DeploymentStatus)
