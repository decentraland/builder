import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { WithAuthorizedActionProps } from 'decentraland-dapps/dist/containers/withAuthorizedAction/withAuthorizedAction.types'
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

export type Props = ModalProps &
  WithAuthorizedActionProps & {
    item: Item<ItemType.WEARABLE | ItemType.EMOTE>
    isLoading: boolean
    isLoadingCancel: boolean
    connectedChainId?: ChainId
    error: string | null
    collection?: Collection
    onCreateItemOrder: typeof createItemOrderTradeRequest
    onRemoveFromSale: typeof cancelItemOrderTradeRequest
  }

export type EditPriceAndBeneficiaryModalMetadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata' | 'item'>
export type MapStateProps = Pick<Props, 'item' | 'isLoading' | 'error' | 'collection' | 'isLoadingCancel' | 'connectedChainId'>
export type MapDispatchProps = Pick<Props, 'onCreateItemOrder' | 'onRemoveFromSale'>
export type MapDispatch = Dispatch<CreateItemOrderTradeRequestAction | CancelItemOrderTradeRequestAction>
