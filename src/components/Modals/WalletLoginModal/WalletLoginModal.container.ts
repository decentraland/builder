import { connect } from 'react-redux'
import { loginRequest } from 'modules/identity/actions'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './WalletLoginModal.types'
import WalletLoginModal from './WalletLoginModal'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: (refreshSession, providerType) => dispatch(loginRequest(refreshSession, providerType))
})

export default connect(mapState, mapDispatch)(WalletLoginModal)
