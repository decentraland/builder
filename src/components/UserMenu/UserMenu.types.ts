import { Dispatch } from 'redux'

import { Profile } from 'modules/profile/types'
import { LoginRequestAction, LogoutAction, logout, loginRequest } from 'modules/identity/actions'

export type Props = {
  isLoggedIn: boolean
  isLoggingIn: boolean
  address?: string
  mana?: number
  profile?: Profile
  onLogout: typeof logout
  onLogin: typeof loginRequest
}

export type State = {
  isOpen: boolean
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'isLoggingIn' | 'address' | 'profile' | 'mana'>
export type MapDispatchProps = Pick<Props, 'onLogin' | 'onLogout'>
export type MapDispatch = Dispatch<LoginRequestAction | LogoutAction>
