import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

import { acceptTerms, AcceptTermsAction } from 'modules/contest/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = ModalProps & {
  onAcceptTerms: typeof acceptTerms
  onOpenModal: typeof openModal
}

export type State = {
  hasAcceptedTerms: boolean
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onAcceptTerms' | 'onOpenModal'>
export type MapDispatch = Dispatch<AcceptTermsAction | OpenModalAction>
