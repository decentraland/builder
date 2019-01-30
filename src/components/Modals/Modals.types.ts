import { Dispatch } from 'redux'
import { ModalProps as BaseModalProps } from 'decentraland-dapps/dist/modules/modal/types'
import { closeModal, CloseModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

export type Props = BaseModalProps & {
  onClose: typeof closeModal
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onClose'>
export type MapDispatch = Dispatch<CloseModalAction>
