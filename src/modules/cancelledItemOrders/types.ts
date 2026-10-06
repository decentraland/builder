import { CancelledTrade } from 'lib/api/cancelledTrades'

export type CancelledItemOrder = CancelledTrade

export type CancelledItemOrdersCollection = {
  id: string
  name: string
}

export type CancelledItemOrdersResult = {
  orders: CancelledItemOrder[]
  // Keyed by lowercased contract address
  collectionsByContractAddress: Record<string, CancelledItemOrdersCollection>
}
