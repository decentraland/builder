import { Dispatch } from 'redux'
import { ENS } from 'modules/ens/types'
import { Land } from 'modules/land/types'
import { openModal } from 'modules/modal/actions'
import { Avatar } from '@dcl/schemas'

export enum SortBy {
  DESC = 'DESC',
  ASC = 'ASC'
}

export type Props = {
  address?: string
  alias?: string | null
  error?: string
  ensList: ENS[]
  lands: Land[]
  hasProfileCreated: boolean
  isLoggedIn: boolean
  isLoading: boolean
  isEnsAddressEnabled: boolean
  avatar: Avatar | null
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type State = {
  page: number
  sortBy: SortBy
}

export type MapStateProps = Pick<
  Props,
  'address' | 'alias' | 'ensList' | 'lands' | 'hasProfileCreated' | 'isLoading' | 'error' | 'isLoggedIn' | 'isEnsAddressEnabled' | 'avatar'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch
