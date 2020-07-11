import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Project } from 'modules/project/types'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/utils'
import { LoginRequestAction, loginRequest } from 'modules/identity/actions'
import { loadPoolsRequest, LoadPoolsRequestAction } from 'modules/pool/actions'
import { Pool } from 'modules/pool/types'

export type DefaultProps = {
  projects: Project[]
}

export type Props = DefaultProps & {
  isFetching: boolean
  isLoggingIn: boolean
  didSync: boolean
  didCreate: boolean
  didMigrate: boolean
  needsMigration: boolean
  isLoggedIn: boolean
  page: number
  sortBy: SortBy
  totalPages: number
  onOpenModal: typeof openModal
  onPageChange: (options: PaginationOptions) => void
  onNavigate: (path: string) => void
  onLogin: typeof loginRequest
  onLoadFromScenePool: typeof loadPoolsRequest
  poolList: Pool[] | null
}

export type MapStateProps = Pick<
  Props,
  | 'projects'
  | 'isFetching'
  | 'isLoggingIn'
  | 'page'
  | 'sortBy'
  | 'totalPages'
  | 'didSync'
  | 'didCreate'
  | 'didMigrate'
  | 'needsMigration'
  | 'isLoggedIn'
  | 'poolList'
>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onPageChange' | 'onLogin' | 'onNavigate' | 'onLoadFromScenePool'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | LoginRequestAction | LoadPoolsRequestAction>
