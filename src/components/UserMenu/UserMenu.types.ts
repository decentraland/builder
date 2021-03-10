import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { UserMenuProps } from 'decentraland-ui'
import { LogoutAction } from 'modules/identity/actions'

export type Props = Partial<UserMenuProps>

export type MapStateProps = Pick<Props, 'isSignedIn' | 'isSigningIn' | 'isActivity' | 'hasActivity'>
export type MapDispatchProps = Pick<Props, 'onClickActivity' | 'onClickSettings' | 'onSignOut'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | LogoutAction>
