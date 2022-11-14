import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getDeploymentStatusByProjectId, getDeploymentsByProjectId } from 'modules/deployment/selectors'
import { MapStateProps, OwnProps } from './DeploymentStatus.types'
import DeploymentStatus from './DeploymentStatus'
import { getData } from 'modules/project/selectors'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  status: getDeploymentStatusByProjectId(state)[ownProps.projectId] || null,
  project: getData(state)[ownProps.projectId] || null,
  deployments: getDeploymentsByProjectId(state)[ownProps.projectId] || []
})

export default connect(mapState)(DeploymentStatus)
