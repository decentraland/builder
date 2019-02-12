import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { deleteProject, DeleteProjectAction, duplicateProject, DuplicateProjectAction } from 'modules/project/actions'

export type DefaultProps = {
  hasSubmittedProject: boolean
  onClick: (project: Project) => any
}

export type Props = DefaultProps & {
  project: Project
  onDeleteProject: typeof deleteProject
  onDuplicateProject: typeof duplicateProject
}

export type MapStateProps = Pick<Props, 'hasSubmittedProject'>
export type MapDispatchProps = Pick<Props, 'onDeleteProject' | 'onDuplicateProject'>
export type MapDispatch = Dispatch<DeleteProjectAction | DuplicateProjectAction>
