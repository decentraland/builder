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
  isLoadingUseAsAlias: boolean
  onNavigate: (path: string) => void
  onChangeProfile: (name: string) => void
}

export type State = {
  page: number
  sortBy: SortBy
  useAsAliasClicked: string
}

export type MapStateProps = Pick<Props, 'address' | 'alias' | 'ensList' | 'lands' | 'isLoading' | 'isLoadingUseAsAlias' | 'isLoggedIn'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onChangeProfile'>
export type MapDispatch = Dispatch
