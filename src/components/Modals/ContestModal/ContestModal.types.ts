import { Dispatch } from 'redux'

import { acceptTerms, AcceptTermsAction } from 'modules/contest/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Props as ModalProps, MapDispatchProps as ModalMapDispatchProps, MapDispatch as ModalMapDispatch } from '../Modals.types'

export type Props = ModalProps & {
  onAcceptTerms: typeof acceptTerms
  onOpenModal: typeof openModal
}

export type State = {
  hasAcceptedTerms: boolean
}

export type MapStateProps = {}
export type MapDispatchProps = ModalMapDispatchProps & Pick<Props, 'onAcceptTerms' | 'onOpenModal'>
export type MapDispatch = ModalMapDispatch & Dispatch<AcceptTermsAction | OpenModalAction>
