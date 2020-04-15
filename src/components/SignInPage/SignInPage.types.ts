import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'

export type Props = SignInProps

export type MapStateProps = Pick<Props, 'isConnected'>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch
