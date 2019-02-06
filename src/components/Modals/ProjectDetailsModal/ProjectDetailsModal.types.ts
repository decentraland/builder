import { Dispatch } from 'redux'
import { RegisterEmailAction } from 'modules/contest/actions'
import { Props as ModalProps, MapDispatchProps as ModalMapDispatchProps, MapDispatch as ModalMapDispatch } from '../Modals.types'
import { Project } from 'modules/project/types'

export type Props = ModalProps & {
  currentProject: Project
}

export type State = {}

export type MapStateProps = {}
export type MapDispatchProps = ModalMapDispatchProps & Pick<Props, 'currentProject'>
export type MapDispatch = ModalMapDispatch & Dispatch<RegisterEmailAction>
