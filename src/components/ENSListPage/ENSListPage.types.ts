import { Dispatch } from 'redux'
import { ENS } from 'modules/ens/types'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/utils'
import { Land } from 'modules/land/types'

export type Props = {
  address?: string
  sortBy: SortBy
  page: number
  totalPages: number
  ensList: ENS[]
  lands: Land[]
  isLoggedIn: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  onPageChange: (options: PaginationOptions) => void
}

export type State = {}

export type MapStateProps = Pick<Props, 'address' | 'ensList' | 'lands' | 'isLoading' | 'isLoggedIn' | 'page' | 'totalPages' | 'sortBy'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onPageChange'>
export type MapDispatch = Dispatch
