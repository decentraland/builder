import { Dispatch } from 'redux'

import { Profile } from 'decentraland-dapps/dist/modules/profile/types'
import { LoginRequestAction, LogoutAction, logout, loginRequest } from 'modules/identity/actions'
import { CallHistoryMethodAction } from 'connected-react-router'

export type Props = {
  isLoggedIn: boolean
  isLoggingIn: boolean
  address?: string
  mana?: number
  profile?: Profile
  onLogout: typeof logout
  onLogin: typeof loginRequest
  pathname: string
  hasPendingTransactions: boolean
  onNavigate: (path: string) => void
}

export type State = {
  isOpen: boolean
}

export type MapStateProps = Pick<
  Props,
  'isLoggedIn' | 'isLoggingIn' | 'address' | 'profile' | 'mana' | 'pathname' | 'hasPendingTransactions'
>
export type MapDispatchProps = Pick<Props, 'onLogin' | 'onLogout' | 'onNavigate'>
export type MapDispatch = Dispatch<LoginRequestAction | LogoutAction | CallHistoryMethodAction>
