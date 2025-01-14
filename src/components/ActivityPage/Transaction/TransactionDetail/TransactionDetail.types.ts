import { Coord } from 'decentraland-ui'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { Item } from 'modules/item/types'

export type Props = {
  selection?: Coord[]
  address?: string
  collectionId?: string
  item?: Item
  subdomain?: string
  slotsToyBuy?: number
  thirdPartyId?: string
  text: React.ReactNode
  tx: Transaction
}
