import { connect } from 'react-redux'
import { isLoggedIn } from 'modules/identity/selectors'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './SignInPage.types'
import SignInPage from './SignInPage'
import { loginRequest } from 'modules/identity/actions'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(loginRequest())
})

export default connect(mapState, mapDispatch)(SignInPage)
