import { CancelledTrade } from 'lib/api/cancelledTrades'

// The cancelled trades endpoint is queried for public item orders only
export type CancelledItemOrder = CancelledTrade

export type CancelledItemOrdersCollection = {
  id: string
  name: string
}
