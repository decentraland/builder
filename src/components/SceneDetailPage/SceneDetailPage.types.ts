import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { deleteProject, duplicateProject, DeleteProjectAction, DuplicateProjectAction } from 'modules/project/actions'

export type Props = {
  project: Project | null
  deployments: Deployment[]
  isLoading: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onDelete: typeof deleteProject
  onDuplicate: typeof duplicateProject
}

export type MapStateProps = Pick<Props, 'project' | 'deployments' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onDelete' | 'onDuplicate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | DeleteProjectAction | DuplicateProjectAction | OpenModalAction>
