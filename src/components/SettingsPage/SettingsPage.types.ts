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
  authorizations: Authorization[]
  onNavigate: (path: string) => void
  onSetUpdateManager: typeof setUpdateManagerRequest
}

export type MapStateProps = Pick<Props, 'address' | 'mana' | 'authorizations'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onSetUpdateManager'>
export type MapDispatch = Dispatch<SetUpdateManagerRequestAction | CallHistoryMethodAction>
