import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { allowClaimManaRequest, AllowClaimManaRequestAction, claimNameRequest, ClaimNameRequestAction } from 'modules/ens/actions'

export type Props = {
  wallet: Wallet | null
  mana: number
  allowance: string
  isLoading: boolean
  onOpenModal: typeof openModal
  onAllowMana: typeof allowClaimManaRequest
  onClaim: typeof claimNameRequest
  onNavigate: (path: string) => void
  onBack: typeof goBack
}

export type State = {
  name: string
  isLoading: boolean
  isAvailable: boolean
  isError: boolean
}

export type MapStateProps = Pick<Props, 'wallet' | 'mana' | 'allowance' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onAllowMana' | 'onClaim' | 'onNavigate' | 'onBack'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | AllowClaimManaRequestAction | ClaimNameRequestAction>
