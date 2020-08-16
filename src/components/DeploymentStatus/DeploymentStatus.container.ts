import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getDeploymentStatusByProjectId, getDeploymentsByProjectId } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './DeploymentStatus.types'
import DeploymentStatus from './DeploymentStatus'
import { getData } from 'modules/project/selectors'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  status: getDeploymentStatusByProjectId(state)[ownProps.projectId] || null,
  project: getData(state)[ownProps.projectId] || null,
  deployments: getDeploymentsByProjectId(state)[ownProps.projectId] || []
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(DeploymentStatus)
