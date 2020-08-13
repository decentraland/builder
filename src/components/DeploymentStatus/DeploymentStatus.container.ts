import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getDeploymentStatusByProjectId, getDeploymentsByProjectId } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './DeploymentStatus.types'
import DeploymentStatus from './DeploymentStatus'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  status: getDeploymentStatusByProjectId(state)[ownProps.projectId] || null,
  deployment: getDeploymentsByProjectId(state)[ownProps.projectId] || null
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(DeploymentStatus)
