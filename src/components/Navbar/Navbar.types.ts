import { NavbarProps } from 'decentraland-dapps/dist/containers/Navbar/Navbar.types'
import { Dispatch } from 'redux'

export type Props = Partial<NavbarProps> & { hasPendingTransactions: boolean; address?: string }

export type MapStateProps = Pick<Props, 'hasPendingTransactions' | 'isSignedIn' | 'address'>
export type MapDispatchProps = Pick<Props, 'onSignIn'>
export type MapDispatch = Dispatch
export type OwnProps = Partial<Props>
