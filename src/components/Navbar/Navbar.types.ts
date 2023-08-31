import { NavbarProps } from 'decentraland-ui'
import { Dispatch } from 'redux'

export type Props = Partial<NavbarProps> & { isNewNavbarEnabled: boolean }

export type MapStateProps = Pick<Props, 'isConnected' | 'isNewNavbarEnabled'>
export type MapDispatchProps = Pick<Props, 'onSignIn'>
export type MapDispatch = Dispatch
export type OwnProps = Partial<Props>
