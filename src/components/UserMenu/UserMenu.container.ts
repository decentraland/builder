import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getData as getProfiles } from 'modules/profile/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './UserMenu.types'
import { logout, loginRequest } from 'modules/identity/actions'
import UserMenu from './UserMenu'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { getAddress, getMana } from 'decentraland-dapps/dist/modules/wallet/selectors'

const mapState = (state: RootState): MapStateProps => {
  const address = getAddress(state)
  return {
    address,
    mana: getMana(state),
    profile: getProfiles(state)[address!],
    isLoggedIn: isLoggedIn(state),
    isLoggingIn: isLoggingIn(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLogout: () => dispatch(logout()),
  onLogin: () => dispatch(loginRequest())
})

export default connect(mapState, mapDispatch)(UserMenu)
