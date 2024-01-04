import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { UserInformationComponentProps } from 'decentraland-ui'
import { OpenLoginModalAction } from 'modules/login/actions'

export type Props = Partial<UserInformationComponentProps> & {
  isAuthDappEnabled: boolean
  onClickSettings: () => void
  onClickActivity: () => void
}

export type MapStateProps = Pick<Props, 'isSignedIn' | 'isSigningIn' | 'hasActivity' | 'isAuthDappEnabled'>
export type MapDispatchProps = Pick<Props, 'onClickActivity' | 'onClickSettings' | 'onSignOut' | 'onSignIn'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenLoginModalAction>
