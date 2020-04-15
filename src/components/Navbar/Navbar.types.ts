import { NavbarProps } from 'decentraland-ui'
import { Dispatch } from 'redux'

export type Props = NavbarProps

export type MapStateProps = Pick<Props, 'isConnected'>
export type MapDispatchProps = Pick<Props, 'onSignIn'>
export type MapDispatch = Dispatch
