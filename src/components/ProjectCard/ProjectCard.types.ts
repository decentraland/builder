import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { deleteProject, DeleteProjectAction, duplicateProject, DuplicateProjectAction } from 'modules/project/actions'
import { DeploymentStatus } from 'modules/deployment/types'

export type DefaultProps = {
  items: number
}

export type Props = DefaultProps & {
  project: Project
  isUploading: boolean
  hasError: boolean
  deploymentStatus: DeploymentStatus
  onClick?: (project: Project) => any
  onDeleteProject: typeof deleteProject
  onDuplicateProject: typeof duplicateProject
  onOpenModal: typeof openModal
}

export type OwnProps = Pick<Props, 'project'>

export type State = {
  isDeleting: boolean
}

export type MapStateProps = Pick<Props, 'items' | 'deploymentStatus' | 'isUploading' | 'hasError'>
export type MapDispatchProps = Pick<Props, 'onDeleteProject' | 'onDuplicateProject' | 'onOpenModal'>
export type MapDispatch = Dispatch<DeleteProjectAction | DuplicateProjectAction | OpenModalAction>
