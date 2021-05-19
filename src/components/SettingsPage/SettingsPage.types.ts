import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Authorization, LandType } from 'modules/land/types'
import { SetUpdateManagerRequestAction, setUpdateManagerRequest } from 'modules/land/actions'

export type State = {
  hasCopiedText: boolean
  managerAddress: string
  type: LandType
}

export type Props = {
  wallet: Wallet | null
  authorizations: Authorization[]
  onNavigate: (path: string) => void
  onSetUpdateManager: typeof setUpdateManagerRequest
}

export type MapStateProps = Pick<Props, 'wallet' | 'authorizations'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onSetUpdateManager'>
export type MapDispatch = Dispatch<SetUpdateManagerRequestAction | CallHistoryMethodAction>
