import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

import { createProjectFromTemplate, CreateProjectFromTemplateAction } from 'modules/project/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Project } from 'modules/project/types'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/utils'
import { LoginRequestAction, loginRequest } from 'modules/identity/actions'

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
  onCreateProject: typeof createProjectFromTemplate
  onOpenModal: typeof openModal
  onPageChange: (options: PaginationOptions) => void
  onNavigate: (path: string) => void
  onLogin: typeof loginRequest
}

export type State = {
  isAnimationPlaying: boolean
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
>
export type MapDispatchProps = Pick<Props, 'onCreateProject' | 'onOpenModal' | 'onPageChange' | 'onLogin' | 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | CreateProjectFromTemplateAction | OpenModalAction | LoginRequestAction>
