import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { UserInformationComponentProps } from 'decentraland-ui'
import { OpenLoginAction } from 'modules/login/actions'

export type Props = Partial<UserInformationComponentProps> & {
  onClickSettings: () => void
  onClickActivity: () => void
}

export type MapStateProps = Pick<Props, 'isSignedIn' | 'isSigningIn' | 'hasActivity'>
export type MapDispatchProps = Pick<Props, 'onClickActivity' | 'onClickSettings' | 'onSignOut' | 'onSignIn'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenLoginAction>
