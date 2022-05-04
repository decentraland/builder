import { Dispatch } from 'redux'
import { DeleteItemRequestAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  item: Item
  onDeleteItem: () => ReturnType<Dispatch<DeleteItemRequestAction>>
  onOpenModal: typeof openModal
}

export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onDeleteItem'>
export type MapDispatch = Dispatch<OpenModalAction | DeleteItemRequestAction>
export type OwnProps = Pick<Props, 'item'>
