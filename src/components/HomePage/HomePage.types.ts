import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

import { createProjectFromTemplate, CreateProjectFromTemplateAction } from 'modules/project/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Project } from 'modules/project/types'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/utils'
import { login, LoginAction } from 'modules/auth/actions'

export type DefaultProps = {
  projects: Project[]
}

export type Props = DefaultProps & {
  isFetching: boolean
  didSync: boolean
  didCreate: boolean
  isLoggedIn: boolean
  page: number
  sortBy: SortBy
  totalPages: number
  onCreateProject: typeof createProjectFromTemplate
  onOpenModal: typeof openModal
  onPageChange: (options: PaginationOptions) => void
  onNavigateToShowcase: () => void
  onLogin: typeof login
}

export type State = {
  isAnimationPlaying: boolean
}

export type MapStateProps = Pick<
  Props,
  'projects' | 'isFetching' | 'page' | 'sortBy' | 'totalPages' | 'didSync' | 'didCreate' | 'isLoggedIn'
>
export type MapDispatchProps = Pick<Props, 'onCreateProject' | 'onOpenModal' | 'onPageChange' | 'onLogin' | 'onNavigateToShowcase'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | CreateProjectFromTemplateAction | OpenModalAction | LoginAction>
