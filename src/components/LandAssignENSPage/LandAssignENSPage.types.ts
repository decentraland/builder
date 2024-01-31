import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'
import { match } from 'react-router'
import {
  setENSContentRequest,
  setENSResolverRequest,
  SetENSResolverRequestAction,
  SetENSContentRequestAction,
  reclaimNameRequest,
  ReclaimNameRequestAction
} from 'modules/ens/actions'
import { ENS, ENSError } from 'modules/ens/types'

export type State = {
  selectedSubdomain: string
}

export type Props = {
  match: match<{ landId: string; subdomain: string }>
  ens: ENS | undefined
  isLoading: boolean
  error: ENSError | null
  isWaitingTxSetContent: boolean
  isWaitingTxSetResolver: boolean
  isWaitingTxReclaim: boolean
  isEnsAddressEnabled: boolean
  onSetENSResolver: typeof setENSResolverRequest
  onSetENSContent: typeof setENSContentRequest
  onReclaimName: typeof reclaimNameRequest
  onBack: typeof goBack
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<
  Props,
  'ens' | 'isLoading' | 'error' | 'isWaitingTxSetContent' | 'isWaitingTxSetResolver' | 'isWaitingTxReclaim' | 'isEnsAddressEnabled'
>
export type MapDispatchProps = Pick<Props, 'onSetENSResolver' | 'onSetENSContent' | 'onReclaimName' | 'onBack' | 'onNavigate'>
export type MapDispatch = Dispatch<
  CallHistoryMethodAction | SetENSResolverRequestAction | SetENSContentRequestAction | ReclaimNameRequestAction
>
export type OwnProps = Pick<Props, 'match'>
