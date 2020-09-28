import { Dispatch } from 'redux'
import { getENSRequest, setENSRequest } from 'modules/ens/actions'
import { ENSState } from 'modules/ens/reducer';

export type Props = {
  address: string | undefined
  error: string | null
  isLoading: boolean
  ens: ENSState
  onSetENS: typeof setENSRequest
  onGetENS: typeof getENSRequest
}

export type MapStateProps = {
  address: string | undefined
  error: string | null
  isLoading: boolean
  ens: ENSState
}
export type MapDispatchProps = Pick<Props, 'onSetENS' | 'onGetENS'>
export type MapDispatch = Dispatch
