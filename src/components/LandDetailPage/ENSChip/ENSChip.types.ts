import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ENS } from 'modules/ens/types'
import { setENSContentRequest, SetENSContentRequestAction } from 'modules/ens/actions'

export type Props = {
  ens: ENS
  isLoading: boolean
  onNavigate: (path: string) => void
  onUnsetENSContent: typeof setENSContentRequest
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onUnsetENSContent'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | SetENSContentRequestAction>
export type OwnProps = Pick<Props, 'ens'>
