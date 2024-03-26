import { AuthIdentity } from 'decentraland-crypto-fetch'
import { NavbarProps } from 'decentraland-dapps/dist/containers/Navbar/Navbar.types'
import { Dispatch } from 'redux'

export type Props = Partial<NavbarProps> & { hasPendingTransactions: boolean; identity?: AuthIdentity }

export type MapStateProps = Pick<Props, 'hasPendingTransactions' | 'isSignedIn' | 'identity'>
export type MapDispatchProps = Pick<Props, 'onSignIn'>
export type MapDispatch = Dispatch
export type OwnProps = Partial<Props>
