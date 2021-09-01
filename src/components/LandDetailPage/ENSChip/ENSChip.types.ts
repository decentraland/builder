import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ENS } from 'modules/ens/types'
import { setENSContentRequest, SetENSContentRequestAction } from 'modules/ens/actions'
import { Land } from 'modules/land/types'

export type Props = {
  land: Land,
  ens: ENS
  isLoading: boolean
  onNavigate: (path: string) => void
  onUnsetENSContent: typeof setENSContentRequest
}

export type State = {
  showConfirmationModal: boolean
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onUnsetENSContent'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | SetENSContentRequestAction>
export type OwnProps = Pick<Props, 'ens' | 'land'>
