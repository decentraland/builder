import { Dispatch } from 'redux'
import { registerEmail, RegisterEmailAction } from 'modules/contest/actions'
import { Props as ModalProps, MapDispatchProps as ModalMapDispatchProps, MapDispatch as ModalMapDispatch } from '../Modals.types'

export type Props = ModalProps & {
  onRegisterEmail: typeof registerEmail
}

export type State = {
  hasAcceptedTerms: boolean
  email: string
}

export type MapStateProps = {}
export type MapDispatchProps = ModalMapDispatchProps & Pick<Props, 'onRegisterEmail'>
export type MapDispatch = ModalMapDispatch & Dispatch<RegisterEmailAction>
