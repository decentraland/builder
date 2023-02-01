import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = ModalProps & {
  metadata: DeleteItemModalMetadata
  isLoading: boolean
  onDeleteItem: typeof deleteItemRequest
}

export type DeleteItemModalMetadata = {
  item: Item
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onDeleteItem'>
export type MapDispatch = Dispatch<DeleteItemRequestAction>
