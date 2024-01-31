import { ModalProps } from 'decentraland-ui'
import { Dispatch } from 'redux'
import { ClearENSErrorsAction, ReclaimNameRequestAction, reclaimNameRequest } from 'modules/ens/actions'
import { ENS } from 'modules/ens/types'

export type Props = ModalProps & {
  error: string | null
  ens: ENS
  isLoadingReclaim: boolean
  isWaitingTxReclaim: boolean
  onReclaim: typeof reclaimNameRequest
  onUnmount: () => void
}

export type MapStateProps = Pick<Props, 'error' | 'isLoading' | 'isLoadingReclaim' | 'isWaitingTxReclaim' | 'ens'>
export type MapDispatchProps = Pick<Props, 'onUnmount' | 'onReclaim'>
export type MapDispatch = Dispatch<ClearENSErrorsAction | ReclaimNameRequestAction>
export type OwnProps = Omit<Props, keyof MapDispatchProps>
