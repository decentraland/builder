import { Dispatch } from 'redux'
import { fetchENSRequest, setENSContentRequest, setENSResolverRequest } from 'modules/ens/actions'
import { ENS, ENSError } from 'modules/ens/types'

export type State = {
  selectedSubdomain: string
}

export type Props = {
  ensList: ENS[]
  isLoading: boolean
  error: ENSError | null
  isWaitingTxSetContent: boolean
  isWaitingTxSetResolver: boolean
  onSetENSResolver: typeof setENSResolverRequest
  onSetENSContent: typeof setENSContentRequest
  onFetchENS: typeof fetchENSRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'ensList' | 'isLoading' | 'error' | 'isWaitingTxSetContent' | 'isWaitingTxSetResolver'>
export type MapDispatchProps = Pick<Props, 'onSetENSResolver' | 'onSetENSContent' | 'onFetchENS' | 'onNavigate'>
export type MapDispatch = Dispatch
