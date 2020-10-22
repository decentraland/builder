import { Dispatch } from 'redux'
import { fetchENSRequest, setENSContentRequest, setENSResolverRequest, fetchDomainListRequest } from 'modules/ens/actions'
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
  onFetchENS: typeof fetchENSRequest
  onFetchDomainList: typeof fetchDomainListRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<
  Props,
  'subdomainList' | 'error' | 'isLoading' | 'isWaitingTxSetContent' | 'isWaitingTxSetResolver' | 'ens'
>
export type MapDispatchProps = Pick<Props, 'onSetENSResolver' | 'onSetENSContent' | 'onFetchENS' | 'onFetchDomainList' | 'onNavigate'>
export type MapDispatch = Dispatch
