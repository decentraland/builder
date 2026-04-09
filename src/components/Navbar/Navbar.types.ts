import { NavbarProps2 } from 'decentraland-dapps/dist/containers/Navbar/Navbar.types'
import { Dispatch } from 'redux'

export type Props = Partial<NavbarProps2> & {
  enablePartialSupportAlert?: boolean
  address?: string
}

export type MapStateProps = Pick<Props, 'isSignedIn' | 'address'>
export type MapDispatchProps = Pick<Props, 'onSignIn'>
export type MapDispatch = Dispatch
export type OwnProps = Partial<Props>
