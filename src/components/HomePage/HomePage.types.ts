import { Dispatch } from 'redux'
import { NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

import { createProjectFromTemplate, CreateProjectFromTemplateAction } from 'modules/project/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Project } from 'modules/project/types'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/locations'

export type DefaultProps = {
  projects: Project[]
}

export type Props = DefaultProps & {
  isFetching: boolean
  didSync: boolean
  page: number
  sortBy: SortBy
  totalPages: number
  onCreateProject: typeof createProjectFromTemplate
  onOpenModal: typeof openModal
  onPageChange: (options: PaginationOptions) => void
}

export type State = {
  isAnimationPlaying: boolean
}

export type MapStateProps = Pick<Props, 'projects' | 'isFetching' | 'page' | 'sortBy' | 'totalPages' | 'didSync'>
export type MapDispatchProps = Pick<Props, 'onCreateProject' | 'onOpenModal' | 'onPageChange'>
export type MapDispatch = Dispatch<NavigateToAction | CreateProjectFromTemplateAction | OpenModalAction>
