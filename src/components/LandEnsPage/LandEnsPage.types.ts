import { Dispatch } from 'redux'
import { getENSRequest, setENSContentRequest, setENSResolverRequest, getDomainListRequest } from 'modules/ens/actions'
import { ENSState, ENSError } from 'modules/ens/reducer'

export type State = {
  selectedName: string
}

export type Props = {
  subdomainList: string[]
  error: ENSError | null
  isLoading: boolean
  isWaitingTxSetContent: boolean
  isWaitingTxSetResolver: boolean
  ens: ENSState
  onSetENSResolver: typeof setENSResolverRequest
  onSetENSContent: typeof setENSContentRequest
  onGetENS: typeof getENSRequest
  onGetDomainList: typeof getDomainListRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<
  Props,
  'subdomainList' | 'error' | 'isLoading' | 'isWaitingTxSetContent' | 'isWaitingTxSetResolver' | 'ens'
>
export type MapDispatchProps = Pick<Props, 'onSetENSResolver' | 'onSetENSContent' | 'onGetENS' | 'onGetDomainList' | 'onNavigate'>
export type MapDispatch = Dispatch
