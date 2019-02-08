import { Project } from 'modules/project/types'
import { deleteProject, DeleteProjectAction } from 'modules/project/actions'
import { Dispatch } from 'redux'

export type Props = {
  project: Project
  onClick?: (project: Project) => any
  onDeleteProject: typeof deleteProject
}

export type MapStateProps = {}

export type MapDispatchProps = Pick<Props, 'onDeleteProject'>

export type MapDispatch = Dispatch<DeleteProjectAction>
