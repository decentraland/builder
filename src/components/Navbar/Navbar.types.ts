import { NavbarProps } from 'decentraland-ui'
import { Dispatch } from 'redux'

export type Props = NavbarProps & {
  isProfileSiteEnabled: boolean
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isProfileSiteEnabled'>
export type MapDispatchProps = Pick<Props, 'onSignIn'>
export type MapDispatch = Dispatch
export type OwnProps = Partial<Props>
