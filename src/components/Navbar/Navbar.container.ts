import { connect } from 'react-redux'
import { isLoggedIn } from 'modules/identity/selectors'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './Navbar.types'
import Navbar from './Navbar'
import { locations } from 'routing/locations'
import { push } from 'connected-react-router'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSignIn: () => dispatch(push(locations.signIn()))
})

export default connect(mapState, mapDispatch)(Navbar)
