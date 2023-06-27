import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getDeploymentStatusByProjectId } from 'modules/deployment/selectors'
import { MapStateProps, OwnProps } from './DeploymentStatus.types'
import DeploymentStatus from './DeploymentStatus'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  status: getDeploymentStatusByProjectId(state)[ownProps.projectId] || null
})

export default connect(mapState)(DeploymentStatus)
