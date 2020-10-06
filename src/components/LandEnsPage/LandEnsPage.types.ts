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
  isWaitingConfirmationTx: boolean
  ens: ENSState
  onSetENSResolver: typeof setENSResolverRequest
  onSetENSContent: typeof setENSContentRequest
  onGetENS: typeof getENSRequest
  onGetDomainList: typeof getDomainListRequest
}

export type MapStateProps = {
  subdomainList: string[]
  error: ENSError | null
  isLoading: boolean
  isWaitingConfirmationTx: boolean
  ens: ENSState
}
export type MapDispatchProps = Pick<Props, 'onSetENSResolver' | 'onSetENSContent' | 'onGetENS' | 'onGetDomainList'>
export type MapDispatch = Dispatch
