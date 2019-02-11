import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { Contest } from 'modules/contest/types'
import { submitProjectRequest, SubmitProjectRequestAction } from 'modules/contest/actions'
import { editProject, EditProjectAction } from 'modules/project/actions'
import {
  Props as ModalProps,
  MapStateProps as ModalMapStateProps,
  MapDispatchProps as ModalMapDispatchProps,
  MapDispatch as ModalMapDispatch
} from '../Modals.types'

export type Props = ModalProps & {
  currentProject: Project
  contest: Contest
  onSaveProject: typeof editProject
  onSubmitProject: typeof submitProjectRequest
}

export type State = {
  project: {
    title: string
    description: string
  }
  contest: {
    email: string
    ethAddress?: string
  }
}

export type MapStateProps = ModalMapStateProps & Pick<Props, 'currentProject' | 'contest'>
export type MapDispatchProps = ModalMapDispatchProps & Pick<Props, 'onSaveProject' | 'onSubmitProject'>
export type MapDispatch = ModalMapDispatch & Dispatch<EditProjectAction | SubmitProjectRequestAction>
