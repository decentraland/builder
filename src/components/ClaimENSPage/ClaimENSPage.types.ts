import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  wallet: Wallet | null
  mana: number
  onOpenModal: typeof openModal
  onNavigate: (path: string) => void
  onBack: typeof goBack
}

export type State = {
  name: string
  isLoading: boolean
  isAvailable: boolean
  isError: boolean
}

export type MapStateProps = Pick<Props, 'wallet' | 'mana'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onNavigate' | 'onBack'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
