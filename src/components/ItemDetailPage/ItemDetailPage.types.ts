import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { deleteItemRequest, DeleteItemRequestAction, saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type State = {
  thumbnail: string
  contents: Record<string, Blob>
}

export type Props = {
  itemId: string | null
  wallet: Wallet
  item: Item | null
  collection: Collection | null
  isLoading: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onDelete: typeof deleteItemRequest
  onSaveItem: typeof saveItemRequest
  hasAccess: boolean
}

export type MapStateProps = Pick<Props, 'wallet' | 'itemId' | 'item' | 'collection' | 'isLoading' | 'hasAccess'>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onNavigate' | 'onDelete' | 'onOpenModal'>
export type MapDispatch = Dispatch<SaveItemRequestAction | CallHistoryMethodAction | DeleteItemRequestAction | OpenModalAction>
