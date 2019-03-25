import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { deleteProject, DeleteProjectAction, duplicateProject, DuplicateProjectAction } from 'modules/project/actions'

export type DefaultProps = {
  hasSubmittedProject: boolean
  items: number
}

export type Props = DefaultProps & {
  project: Project
  onClick?: (project: Project) => any
  onDeleteProject: typeof deleteProject
  onDuplicateProject: typeof duplicateProject
}

export type State = {
  isDeleting: boolean
}

export type MapStateProps = Pick<Props, 'hasSubmittedProject' | 'items'>
export type MapDispatchProps = Pick<Props, 'onDeleteProject' | 'onDuplicateProject'>
export type MapDispatch = Dispatch<DeleteProjectAction | DuplicateProjectAction>
