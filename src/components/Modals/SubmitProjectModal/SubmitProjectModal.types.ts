import { Dispatch } from 'redux'
import { Props as ModalProps, MapDispatchProps as ModalMapDispatchProps, MapDispatch as ModalMapDispatch } from '../Modals.types'

export type Props = ModalProps & {}

export type State = {
  title: string
  description: string
}

export type MapStateProps = {}
export type MapDispatchProps = ModalMapDispatchProps & {}
export type MapDispatch = ModalMapDispatch & Dispatch<any>
