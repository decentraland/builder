import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { fetchENSRequest, FetchENSRequestAction } from 'modules/ens/actions'
import { ENS, ENSError } from 'modules/ens/types'

export type Props = {
  ensList: ENS[]
  error: ENSError
  isLoading: boolean
  onFetchENS: typeof fetchENSRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'ensList'>
export type MapDispatchProps = Pick<Props, 'onFetchENS' | 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | FetchENSRequestAction>
