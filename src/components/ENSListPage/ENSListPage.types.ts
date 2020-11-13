import { Dispatch } from 'redux'
import { ENS } from 'modules/ens/types'
import { Land } from 'modules/land/types'

export enum SortBy {
  NEWEST = 'newest',
  NAME = 'name'
}

export type Props = {
  address?: string
  alias?: string | null
  ensList: ENS[]
  lands: Land[]
  isLoggedIn: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
}

export type State = {
  page: number
  sortBy: SortBy
}

export type MapStateProps = Pick<Props, 'address' | 'alias' | 'ensList' | 'lands' | 'isLoading' | 'isLoggedIn'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch
