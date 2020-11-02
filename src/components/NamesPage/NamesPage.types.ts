import { Dispatch } from 'redux'
import { Name } from 'modules/names/types'
import { fetchNamesRequest } from 'modules/names/actions'

export type Props = {
  address?: string
  names: Name[]
  isLoggedIn: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  onFetchNames: typeof fetchNamesRequest
}

export type State = {
  page: number
}

export type MapStateProps = Pick<Props, 'address' | 'names' | 'isLoading' | 'isLoggedIn'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onFetchNames'>
export type MapDispatch = Dispatch
