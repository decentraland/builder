import { NavbarProps } from 'decentraland-ui'
import { Dispatch } from 'redux'

export type Props = Partial<NavbarProps> & { isNewNavbarEnabled: boolean; hasPendingTransactions: boolean }

export type MapStateProps = Pick<Props, 'hasPendingTransactions' | 'isConnected' | 'isNewNavbarEnabled' | 'isNavbarV2Enabled'>
export type MapDispatchProps = Pick<Props, 'onSignIn'>
export type MapDispatch = Dispatch
export type OwnProps = Partial<Props>
