import { Dispatch } from 'redux'

import { logout, LogoutAction, login, LoginAction } from 'modules/auth/actions'
import { User } from 'modules/auth/types'

export type Props = {
  isLoggedIn: boolean
  isLoggingIn: boolean
  user: User | null
  onLogout: typeof logout
  onLogin: typeof login
}

export type State = {
  isOpen: boolean
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'isLoggingIn' | 'user'>
export type MapDispatchProps = Pick<Props, 'onLogin' | 'onLogout'>
export type MapDispatch = Dispatch<LoginAction | LogoutAction>
