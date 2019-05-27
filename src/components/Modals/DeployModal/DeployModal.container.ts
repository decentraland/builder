import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { setUserEmail } from 'modules/user/actions'
import { getEmail, getEthAddress } from 'modules/user/selectors'
import { isLoading, getError } from 'modules/deployment/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { MapStateProps, MapDispatchProps } from './DeployModal.types'
import DeployModal from './DeployModal'

const mapState = (state: RootState): MapStateProps => ({
  error: getError(state),
  userEmail: getEmail(state),
  userEthAddress: getEthAddress(state),
  currentProject: getCurrentProject(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onSetEmail: email => dispatch(setUserEmail(email))
})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
