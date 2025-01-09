import { NavbarProps } from 'decentraland-dapps/dist/containers/Navbar/Navbar.types'
import { Dispatch } from 'redux'

export type Props = Partial<NavbarProps> & { hasPendingTransactions: boolean; address?: string; isNavbar2Enabled: boolean }

export type MapStateProps = Pick<Props, 'hasPendingTransactions' | 'isSignedIn' | 'address' | 'isNavbar2Enabled'>
export type MapDispatchProps = Pick<Props, 'onSignIn'>
export type MapDispatch = Dispatch
export type OwnProps = Partial<Props>
