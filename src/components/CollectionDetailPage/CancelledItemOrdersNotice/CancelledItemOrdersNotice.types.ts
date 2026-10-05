import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { CancelledItemOrder } from 'modules/cancelledTrades/types'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  orders: CancelledItemOrder[]
  onOpenModal: ActionFunction<typeof openModal>
}

export type OwnProps = Pick<Props, 'collection' | 'items'>
