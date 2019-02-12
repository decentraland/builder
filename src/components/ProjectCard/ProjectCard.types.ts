import { Project } from 'modules/project/types'
import { deleteProject, DeleteProjectAction, duplicateProject, DuplicateProjectAction } from 'modules/project/actions'
import { Dispatch } from 'redux'

export type Props = {
  project: Project
  onClick?: (project: Project) => any
  onDeleteProject: typeof deleteProject
  onDuplicateProject: typeof duplicateProject
}

export type MapStateProps = {}

export type MapDispatchProps = Pick<Props, 'onDeleteProject' | 'onDuplicateProject'>

export type MapDispatch = Dispatch<DeleteProjectAction | DuplicateProjectAction>
