import { Dispatch } from 'redux'

import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Project } from 'modules/project/types'
import { SortBy } from 'modules/ui/dashboard/types'
import { loadPoolsRequest, LoadPoolsRequestAction } from 'modules/pool/actions'
import { Pool } from 'modules/pool/types'

export type DefaultProps = {
  projects: Project[]
}

export type Props = DefaultProps & {
  isFetching: boolean
  isLoggingIn: boolean
  didCreate: boolean
  page: number
  sortBy: SortBy
  totalPages: number
  poolList: Pool[] | null
  onOpenModal: typeof openModal
  onLoadFromScenePool: typeof loadPoolsRequest
}

export type MapStateProps = Pick<
  Props,
  'projects' | 'isFetching' | 'isLoggingIn' | 'page' | 'sortBy' | 'totalPages' | 'didCreate' | 'poolList'
>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onLoadFromScenePool'>
export type MapDispatch = Dispatch<OpenModalAction | LoadPoolsRequestAction>
