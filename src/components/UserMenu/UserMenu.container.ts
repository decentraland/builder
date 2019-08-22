import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { logout, login } from 'modules/auth/actions'
import { isLoggedIn, getEmail, getFace, getName, isLoggingIn } from 'modules/auth/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './UserMenu.types'
import UserMenu from './UserMenu'

const mapState = (state: RootState): MapStateProps => {
  return {
    email: getEmail(state),
    name: getName(state),
    face: getFace(state),
    isLoggedIn: isLoggedIn(state),
    isLoggingIn: isLoggingIn(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLogout: () => dispatch(logout()),
  onLogin: () => dispatch(login())
})

export default connect(
  mapState,
  mapDispatch
)(UserMenu)
