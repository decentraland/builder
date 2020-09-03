import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Item } from 'modules/item/types'
import { editItemRequest, EditItemRequestAction } from 'modules/item/actions'

export type Props = ModalProps & {
  item: Item | null
  isLoading: boolean
  metadata: EditItemModalMetadata
  onEdit: typeof editItemRequest
}

export type EditItemModalMetadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'item' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onEdit'>
export type MapDispatch = Dispatch<EditItemRequestAction>
