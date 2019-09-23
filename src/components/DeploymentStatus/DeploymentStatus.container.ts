import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { queryRemoteCID } from 'modules/deployment/actions'
import { getDeploymentStatus, getData as getDeployments } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './DeploymentStatus.types'
import DeploymentStatus from './DeploymentStatus'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  status: getDeploymentStatus(state)[ownProps.projectId],
  deployment: getDeployments(state)[ownProps.projectId]
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onQueryRemoteCID: (projectId: string) => dispatch(queryRemoteCID(projectId))
})

export default connect(
  mapState,
  mapDispatch
)(DeploymentStatus)
