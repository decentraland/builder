import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps } from './DeployModal.types'
import DeployModal from './DeployModal'
import { getCurrentDeployment } from 'modules/deployment/selectors'

const mapState = (state: RootState): MapStateProps => ({
  deployment: getCurrentDeployment(state)
})

const mapDispatch = (_: Dispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
