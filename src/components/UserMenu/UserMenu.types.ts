import { Dispatch } from 'redux'

import { logout, LogoutAction, login, LoginAction } from 'modules/auth/actions'

export type Props = {
  isLoggedIn: boolean
  isLoggingIn: boolean
  email: string | null
  name: string | null
  face: string | null
  onLogout: typeof logout
  onLogin: typeof login
}

export type State = {
  isOpen: boolean
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'isLoggingIn' | 'email' | 'name' | 'face'>
export type MapDispatchProps = Pick<Props, 'onLogin' | 'onLogout'>
export type MapDispatch = Dispatch<LoginAction | LogoutAction>
