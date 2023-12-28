import { connect } from 'react-redux'
import { loginRequest } from 'modules/identity/actions'
import { MapDispatchProps, MapDispatch } from './WalletLoginModal.types'
import WalletLoginModal from './WalletLoginModal'
import { RootState } from 'modules/common/types'
import { getIsAuthDappEnabled } from 'modules/features/selectors'

const mapState = (state: RootState) => ({
  isAuthDappEnabled: getIsAuthDappEnabled(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: providerType => dispatch(loginRequest(providerType))
})

export default connect(mapState, mapDispatch)(WalletLoginModal)
