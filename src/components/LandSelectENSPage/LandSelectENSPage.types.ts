import { Dispatch } from 'redux'
import { RouteComponentProps } from 'react-router-dom'
import { fetchENSRequest, FetchENSRequestAction } from 'modules/ens/actions'
import { ENS, ENSError } from 'modules/ens/types'

export type Props = {
  ensList: ENS[]
  error: ENSError
  isLoading: boolean
  onFetchENS: typeof fetchENSRequest
} & RouteComponentProps

export type MapStateProps = Pick<Props, 'ensList'>
export type MapDispatchProps = Pick<Props, 'onFetchENS'>
export type MapDispatch = Dispatch<FetchENSRequestAction>
