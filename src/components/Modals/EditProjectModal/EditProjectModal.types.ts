import { Dispatch } from 'redux'
import { Props as ModalProps, MapDispatchProps as ModalMapDispatchProps, MapDispatch as ModalMapDispatch } from '../Modals.types'
import { editProject, EditProjectAction } from 'modules/project/actions'
import { Project } from 'modules/project/types'

export type Props = ModalProps & {
  currentProject: Project
  onSave: typeof editProject
}

export type State = {
  title: string
  description: string
}

export type MapStateProps = Pick<Props, 'currentProject'>
export type MapDispatchProps = ModalMapDispatchProps & Pick<Props, 'onSave'>
export type MapDispatch = ModalMapDispatch & Dispatch<EditProjectAction>
