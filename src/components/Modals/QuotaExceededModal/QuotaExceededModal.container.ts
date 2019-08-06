import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { authRequest } from 'modules/auth/actions'
import { MapDispatchProps } from './QuotaExceededModal.types'
import QuotaExceededModal from './QuotaExceededModal'

const mapState = () => ({})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onAuth: () => dispatch(authRequest())
})

export default connect(
  mapState,
  mapDispatch
)(QuotaExceededModal)
