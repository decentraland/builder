import { ChainId, Network, TradeAssetType } from '@dcl/schemas'
import { CancelledTradeReason, CancelledTradeType } from 'lib/api/cancelledTrades'
import { CancelledItemOrder } from 'modules/cancelledTrades/types'

export function buildCancelledItemOrder(overrides: Partial<CancelledItemOrder> = {}): CancelledItemOrder {
  return {
    id: 'a-trade-id',
    type: CancelledTradeType.PUBLIC_ITEM_ORDER,
    network: Network.MATIC,
    chainId: ChainId.MATIC_AMOY,
    contract: '0xoffchainmarketplace',
    reason: CancelledTradeReason.CONTRACT_SIGNATURE_INDEX_BUMP,
    createdAt: 1700000000000,
    expiresAt: 1900000000000,
    cancelledAt: 1800000000000,
    asset: {
      contractAddress: '0xCollection',
      tokenId: null,
      itemId: '0',
      name: 'An item',
      image: 'https://example.com/thumbnail.png'
    },
    price: { assetType: TradeAssetType.ERC20, amount: '1500000000000000000' },
    ...overrides
  }
}
