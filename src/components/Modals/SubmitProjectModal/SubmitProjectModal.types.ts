import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import {
  Props as ModalProps,
  MapStateProps as ModalMapStateProps,
  MapDispatchProps as ModalMapDispatchProps,
  MapDispatch as ModalMapDispatch
} from '../Modals.types'

export type Props = ModalProps & {
  currentProject: Project
}

export type State = {
  title: string
  description: string
}

export type MapStateProps = ModalMapStateProps & Pick<Props, 'currentProject'>
export type MapDispatchProps = ModalMapDispatchProps & {}
export type MapDispatch = ModalMapDispatch & Dispatch<any>
