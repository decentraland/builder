import { Collection } from 'modules/collection/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { deleteItemRequest } from 'modules/item/actions'

export type Props = {
  address?: string
  collection?: Collection
  isLoggedIn: boolean
  isReviewing: boolean
  onOpenModal: ActionFunction<typeof openModal>
  onDeleteCollection: ActionFunction<typeof deleteCollectionRequest>
  onDeleteItem: ActionFunction<typeof deleteItemRequest>
  hasEditRights: boolean
  hasUserOrphanItems: boolean | undefined
}
