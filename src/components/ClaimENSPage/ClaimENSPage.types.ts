import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'
import { ENS } from 'modules/ens/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { claimNameRequest, ClaimNameRequestAction } from 'modules/ens/actions'

export type Props = {
  ensList: ENS[]
  address: string
  onOpenModal: typeof openModal
  onClaim: typeof claimNameRequest
  onNavigate: (path: string) => void
  onBack: typeof goBack
}

export type State = {
  name: string
  amountApproved: number
  isLoading: boolean
}

export type MapStateProps = Pick<Props, 'address' | 'ensList'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onClaim' | 'onNavigate' | 'onBack'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | ClaimNameRequestAction>
