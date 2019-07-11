import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getDeployment } from 'modules/deployment/selectors'
import { MapStateProps, MapDispatchProps, OwnProps } from './DeployModal.types'
import DeployModal from './DeployModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  deployment: getDeployment(ownProps.metadata.projectId)(state)
})

const mapDispatch = (_: Dispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
