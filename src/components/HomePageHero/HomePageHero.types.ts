import { Dispatch } from 'redux'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  onOpenModal: typeof openModal
}

export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
