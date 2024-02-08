import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { loginRequest, LoginRequestAction } from 'modules/identity/actions'

export type Props = Omit<SignInProps, 'onConnect'> & {
  onConnect: typeof loginRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting'>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<LoginRequestAction>
