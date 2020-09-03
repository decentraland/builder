import { Dispatch } from 'redux'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  item: Item
  onOpenModal: typeof openModal
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
