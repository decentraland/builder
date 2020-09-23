import { Dispatch } from 'redux'
import { setNameResolverRequest } from 'modules/land/actions'
import {getENSRequest} from 'modules/ens/actions'
import {ENSState} from 'modules/ens/reducer';

export type Props = {
  error: string | null
  isLoading: boolean
  ens: ENSState
  onSetNameResolver: typeof setNameResolverRequest
  onGetENS: typeof getENSRequest
}

export type MapStateProps = {
  error: string | null
  isLoading: boolean
  ens: ENSState
}
export type MapDispatchProps = Pick<Props, 'onSetNameResolver' | 'onGetENS'>
export type MapDispatch = Dispatch
