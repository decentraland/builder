import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { queryRemoteCID } from 'modules/deployment/actions'
import { getCurrentDeployment, getDeploymentStatus } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './DeploymentStatus.types'
import DeploymentStatus from './DeploymentStatus'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  status: getDeploymentStatus(ownProps.projectId)(state),
  deployment: getCurrentDeployment(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onQueryRemoteCID: (projectId: string) => dispatch(queryRemoteCID(projectId))
})

export default connect(
  mapState,
  mapDispatch
)(DeploymentStatus)
