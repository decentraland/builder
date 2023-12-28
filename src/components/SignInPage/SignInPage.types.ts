import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { loginRequest, LoginRequestAction } from 'modules/identity/actions'

export type Props = Omit<SignInProps, 'onConnect'> & {
  onConnect: typeof loginRequest
  isAuthDappEnabled: boolean
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isAuthDappEnabled'>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<LoginRequestAction>
