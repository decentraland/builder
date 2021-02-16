import { connect } from 'react-redux'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoggedIn } from 'modules/identity/selectors'
import { loginRequest } from 'modules/identity/actions'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SignInPage.types'
import SignInPage from './SignInPage'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isLoggedIn(state),
  isConnecting: isConnecting(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: providerType => dispatch(loginRequest(providerType))
})

export default connect(mapState, mapDispatch)(SignInPage)
