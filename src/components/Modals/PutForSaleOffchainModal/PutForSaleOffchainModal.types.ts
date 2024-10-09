import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'
import {
  cancelItemOrderTradeRequest,
  CancelItemOrderTradeRequestAction,
  createItemOrderTradeRequest,
  CreateItemOrderTradeRequestAction
} from 'modules/item/actions'
import { Item, ItemType } from 'modules/item/types'
import { Dispatch } from 'redux'

export type Props = ModalProps & {
  item: Item<ItemType.WEARABLE | ItemType.EMOTE>
  isLoading: boolean
  isLoadingCancel: boolean
  error: string | null
  collection?: Collection
  onCreateItemOrder: typeof createItemOrderTradeRequest
  onRemoveFromSale: typeof cancelItemOrderTradeRequest
}

export type EditPriceAndBeneficiaryModalMetadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata' | 'item'>
export type MapStateProps = Pick<Props, 'item' | 'isLoading' | 'error' | 'collection' | 'isLoadingCancel'>
export type MapDispatchProps = Pick<Props, 'onCreateItemOrder' | 'onRemoveFromSale'>
export type MapDispatch = Dispatch<CreateItemOrderTradeRequestAction | CancelItemOrderTradeRequestAction>
