import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { CancelledItemOrder } from 'modules/cancelledItemOrders/types'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  orders: CancelledItemOrder[]
  isIncomplete: boolean
  onOpenModal: ActionFunction<typeof openModal>
}

export type OwnProps = Pick<Props, 'collection' | 'items'>
