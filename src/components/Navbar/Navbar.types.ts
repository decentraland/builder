import { NavbarProps } from 'decentraland-ui/dist/components/Navbar/Navbar.types'
import { Dispatch } from 'redux'

export type Props = Partial<NavbarProps> & { isNewNavbarEnabled: boolean; hasPendingTransactions: boolean }

export type MapStateProps = Pick<Props, 'hasPendingTransactions' | 'isSignedIn' | 'isNewNavbarEnabled'>
export type MapDispatchProps = Pick<Props, 'onClickSignIn'>
export type MapDispatch = Dispatch
export type OwnProps = Partial<Props>
