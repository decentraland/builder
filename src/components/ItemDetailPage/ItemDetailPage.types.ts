import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { deleteItemRequest, saveItemRequest } from 'modules/item/actions'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'

export type State = {
  thumbnail: string
  contents: Record<string, Blob>
}

export type Props = {
  itemId: string | null
  wallet: Wallet
  item: Item | null
  collection: Collection | null
  status: SyncStatus | null
  isLoading: boolean
  isWearableUtilityEnabled: boolean
  onOpenModal: ActionFunction<typeof openModal>
  onDelete: ActionFunction<typeof deleteItemRequest>
  onSaveItem: ActionFunction<typeof saveItemRequest>
  hasAccess: boolean
}
