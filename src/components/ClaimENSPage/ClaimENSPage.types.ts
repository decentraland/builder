import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { ClaimNameLocationStateProps } from 'modules/location/types'

export type Props = {
  wallet: Wallet | null
  mana: number
  projectId: string | null
  isFromDeployToWorld: boolean
  onOpenModal: typeof openModal
  onNavigate: (path: string, locationState?: ClaimNameLocationStateProps) => void
  onBack: typeof goBack
}

export type State = {
  name: string
  isLoading: boolean
  isAvailable: boolean
  isError: boolean
}

export type MapStateProps = Pick<Props, 'wallet' | 'mana' | 'projectId' | 'isFromDeployToWorld'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onNavigate' | 'onBack'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
