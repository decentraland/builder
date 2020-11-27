import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'
import { ERC20TransactionReceipt } from 'contracts/ERC20'

export type Props = {
  address: string
  onNavigate: (path: string) => void
  onBack: typeof goBack
}

export type State = {
  name: string
  amountApproved: number
  isLoading: boolean
  tx: ERC20TransactionReceipt | undefined
}

export type MapStateProps = Pick<Props, 'address'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onBack'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
