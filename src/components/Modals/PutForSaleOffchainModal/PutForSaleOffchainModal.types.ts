import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'
import { createItemOrderTradeRequest, CreateItemOrderTradeRequestAction } from 'modules/item/actions'
import { Item, ItemType } from 'modules/item/types'
import { Dispatch } from 'redux'

export type Props = ModalProps & {
  item: Item<ItemType.WEARABLE | ItemType.EMOTE>
  isLoading: boolean
  error: string | null
  collection?: Collection
  onCreateItemOrder: typeof createItemOrderTradeRequest
}

export type EditPriceAndBeneficiaryModalMetadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata' | 'item'>
export type MapStateProps = Pick<Props, 'item' | 'isLoading' | 'error' | 'collection'>
export type MapDispatchProps = Pick<Props, 'onCreateItemOrder'>
export type MapDispatch = Dispatch<CreateItemOrderTradeRequestAction>
