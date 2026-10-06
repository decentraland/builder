import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { CancelledTrade } from 'lib/api/cancelledTrades'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  address: string
  collection: Collection
  items: Item[]
  orders: CancelledTrade[]
  isIncomplete: boolean
  onOpenModal: ActionFunction<typeof openModal>
}

export type OwnProps = Pick<Props, 'collection' | 'items'>
