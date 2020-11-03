import { Dispatch } from 'redux'
import { Name } from 'modules/names/types'
import { fetchNamesRequest } from 'modules/names/actions'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/utils'

export type Props = {
  address?: string
  sortBy: SortBy
  page: number
  totalPages: number
  names: Name[]
  isLoggedIn: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  onFetchNames: typeof fetchNamesRequest
  onPageChange: (options: PaginationOptions) => void
}

export type State = {}

export type MapStateProps = Pick<Props, 'address' | 'names' | 'isLoading' | 'isLoggedIn' | 'page' | 'totalPages' | 'sortBy'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onFetchNames' | 'onPageChange'>
export type MapDispatch = Dispatch
