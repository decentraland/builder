import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { deleteProject, DeleteProjectAction, duplicateProject, DuplicateProjectAction } from 'modules/project/actions'

export type DefaultProps = {
  items: number
}

export type Props = DefaultProps & {
  project: Project
  onClick?: (project: Project) => any
  onDeleteProject: typeof deleteProject
  onDuplicateProject: typeof duplicateProject
  onOpenModal: typeof openModal
}

export type State = {
  isDeleting: boolean
}

export type MapStateProps = Pick<Props, 'items'>
export type MapDispatchProps = Pick<Props, 'onDeleteProject' | 'onDuplicateProject' | 'onOpenModal'>
export type MapDispatch = Dispatch<DeleteProjectAction | DuplicateProjectAction | OpenModalAction>
