import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { mintItemsRequest, MintItemsRequestAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = ModalProps & {
  metadata: CreateItemModalMetadata
  items: Item[]
  isLoading: boolean
  onSubmit: typeof mintItemsRequest
}

export type CreateItemModalMetadata = {
  itemIds: string[]
}

export type MapStateProps = Pick<Props, 'items' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<MintItemsRequestAction>
