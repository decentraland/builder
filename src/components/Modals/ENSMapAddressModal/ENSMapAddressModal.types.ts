import { ModalProps } from 'decentraland-ui'
import { Dispatch } from 'redux'
import {
  ClearENSErrorsAction,
  SetENSAddressRequestAction,
  SetENSResolverRequestAction,
  clearENSErrors,
  setENSResolverRequest
} from 'modules/ens/actions'
import { ENS } from 'modules/ens/types'

export type Props = ModalProps & {
  error: string | null
  isLoading: boolean
  isLoadingSetResolver: boolean
  isWaitingTxSetResolver: boolean
  ens: ENS
  onSave: (address: string) => void
  onUnmount: typeof clearENSErrors
  onSetENSResolver: typeof setENSResolverRequest
}

export type MapStateProps = Pick<Props, 'error' | 'isLoading' | 'isLoadingSetResolver' | 'isWaitingTxSetResolver' | 'ens'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onUnmount' | 'onSetENSResolver'>
export type MapDispatch = Dispatch<SetENSAddressRequestAction | ClearENSErrorsAction | SetENSResolverRequestAction>
export type OwnProps = Omit<Props, keyof MapDispatchProps>
