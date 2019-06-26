import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { MapStateProps } from './DeploymentStatus.types'
import DeploymentStatus from './DeploymentStatus'
import { getDeploymentStatus, getDeployment } from 'modules/deployment/selectors'

const mapState = (state: RootState): MapStateProps => ({
  status: getDeploymentStatus(state),
  deployment: getDeployment(state)
})

const mapDispatch = () => ({})

export default connect(
  mapState,
  mapDispatch
)(DeploymentStatus)
