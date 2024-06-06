import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item, ItemType, SyncStatus } from 'modules/item/types'
import { fetchCollectionForumPostReplyRequest, FetchCollectionForumPostReplyRequestAction } from 'modules/forum/actions'

export type Props = {
  wallet: Wallet
  collection: Collection | null
  isOnSaleLoading: boolean
  isLoading: boolean
  items: Item[]
  status: SyncStatus
  onOpenModal: typeof openModal
  onFetchCollectionForumPostReply: typeof fetchCollectionForumPostReplyRequest
}

export type State = {
  tab: ItemType
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'isOnSaleLoading' | 'isLoading' | 'items' | 'status'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onFetchCollectionForumPostReply'>
export type MapDispatch = Dispatch<OpenModalAction | FetchCollectionForumPostReplyRequestAction>
