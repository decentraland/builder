import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatchProps, OwnProps } from './DeployModal.types'
import DeployModal from './DeployModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  deployment: getDeployments(state)[ownProps.metadata.projectId]
})

const mapDispatch = (_: Dispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
