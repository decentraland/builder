import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item, ItemType, SyncStatus } from 'modules/item/types'
import { fetchCollectionForumPostReplyRequest } from 'modules/forum/actions'

export type Props = {
  wallet: Wallet
  collection: Collection | null
  isOnSaleLoading: boolean
  isLoading: boolean
  items: Item[]
  status: SyncStatus
  lastLocation?: string
  isOffchainPublicItemOrdersEnabled: boolean
  onOpenModal: typeof openModal
  onFetchCollectionForumPostReply: typeof fetchCollectionForumPostReplyRequest
}

export type State = {
  tab: ItemType
}
