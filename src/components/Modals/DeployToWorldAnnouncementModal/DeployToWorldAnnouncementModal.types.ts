import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = ModalProps & {
  onOpenModal: typeof openModal
}

export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
