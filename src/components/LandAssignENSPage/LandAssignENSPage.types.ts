import { Dispatch } from 'redux'
import { RouteComponentProps, match } from 'react-router'
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
  onSetENSResolver: typeof setENSResolverRequest
  onSetENSContent: typeof setENSContentRequest
  onReclaimName: typeof reclaimNameRequest
} & RouteComponentProps

export type MapStateProps = Pick<
  Props,
  'ens' | 'isLoading' | 'error' | 'isWaitingTxSetContent' | 'isWaitingTxSetResolver' | 'isWaitingTxReclaim'
>
export type MapDispatchProps = Pick<Props, 'onSetENSResolver' | 'onSetENSContent' | 'onReclaimName'>
export type MapDispatch = Dispatch<SetENSResolverRequestAction | SetENSContentRequestAction | ReclaimNameRequestAction>
export type OwnProps = Pick<Props, 'match'>
