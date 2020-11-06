import { Dispatch } from 'redux'
import { ENS } from 'modules/ens/types'
import { fetchDomainListRequest } from 'modules/ens/actions'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/utils'

export type Props = {
  address?: string
  sortBy: SortBy
  page: number
  totalPages: number
  names: ENS[]
  isLoggedIn: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  onFetchNames: typeof fetchDomainListRequest
  onPageChange: (options: PaginationOptions) => void
}

export type State = {}

export type MapStateProps = Pick<Props, 'address' | 'names' | 'isLoading' | 'isLoggedIn' | 'page' | 'totalPages' | 'sortBy'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onFetchNames' | 'onPageChange'>
export type MapDispatch = Dispatch
