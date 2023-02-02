import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item, ItemType, SyncStatus } from 'modules/item/types'
import { fetchCollectionForumPostReplyRequest, FetchCollectionForumPostReplyRequestAction } from 'modules/forum/actions'

export type Props = {
  tab?: ItemType
  wallet: Wallet
  collection: Collection | null
  isOnSaleLoading: boolean
  isLoading: boolean
  items: Item[]
  status: SyncStatus
  onNavigate: (path: string, prop?: CollectionDetailLocationState) => void
  onOpenModal: typeof openModal
  onFetchCollectionForumPostReply: typeof fetchCollectionForumPostReplyRequest
}

export type CollectionDetailLocationState = {
  fromParam?: string
}

export type State = {
  tab: ItemType
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'isOnSaleLoading' | 'isLoading' | 'items' | 'tab' | 'status'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onFetchCollectionForumPostReply'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | FetchCollectionForumPostReplyRequestAction>
