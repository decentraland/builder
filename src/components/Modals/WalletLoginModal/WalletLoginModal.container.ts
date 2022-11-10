import { connect } from 'react-redux'
import { loginRequest } from 'modules/identity/actions'
import { MapDispatchProps, MapDispatch } from './WalletLoginModal.types'
import WalletLoginModal from './WalletLoginModal'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: providerType => dispatch(loginRequest(providerType))
})

export default connect(null, mapDispatch)(WalletLoginModal)
