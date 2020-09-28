import { Dispatch } from 'redux'
import { getENSRequest, setENSRequest, getDomainListRequest } from 'modules/ens/actions'
import { ENSState } from 'modules/ens/reducer';

export type Props = {
  subdomainList: string[]
  error: string | null
  isLoading: boolean
  ens: ENSState
  onSetENS: typeof setENSRequest
  onGetENS: typeof getENSRequest
  onGetDomainList: typeof getDomainListRequest
}

export type MapStateProps = {
  subdomainList: string[]
  error: string | null
  isLoading: boolean
  ens: ENSState
}
export type MapDispatchProps = Pick<Props, 'onSetENS' | 'onGetENS' | 'onGetDomainList'>
export type MapDispatch = Dispatch
