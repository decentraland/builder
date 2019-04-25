import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { getEmail } from 'modules/user/selectors'
import { setUserEmail } from 'modules/user/actions'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps } from './DeployModal.types'
import DeployModal from './DeployModal'

const mapState = (state: RootState): MapStateProps => ({
  email: getEmail(state)
})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onSetEmail: email => dispatch(setUserEmail(email))
})

export default connect(
  mapState,
  mapDispatch
)(DeployModal)
