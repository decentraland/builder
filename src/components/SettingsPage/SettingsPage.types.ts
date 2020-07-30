import { Authorization, LandType } from 'modules/land/types'
import { Dispatch } from 'redux'
import { SetUpdateManagerRequestAction, setUpdateManagerRequest } from 'modules/land/actions'
import { CallHistoryMethodAction } from 'connected-react-router'

export type State = {
  hasCopiedText: boolean
  managerAddress: string
  type: LandType
}

export type Props = {
  mana?: number
  address?: string
  isLoggedIn: boolean
  isLoggingIn: boolean
  authorizations: Authorization[]
  onNavigate: (path: string) => void
  onSetUpdateManager: typeof setUpdateManagerRequest
}

export type MapStateProps = Pick<Props, 'address' | 'mana' | 'isLoggedIn' | 'isLoggingIn' | 'authorizations'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onSetUpdateManager'>
export type MapDispatch = Dispatch<SetUpdateManagerRequestAction | CallHistoryMethodAction>
