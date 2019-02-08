import { Dispatch } from 'redux'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { acceptTerms, AcceptTermsAction } from 'modules/contest/actions'
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
