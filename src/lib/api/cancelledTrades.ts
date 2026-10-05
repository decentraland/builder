import { ChainId, Network, TradeAssetType } from '@dcl/schemas'
import { BaseClient, BaseClientConfig } from 'decentraland-dapps/dist/lib/BaseClient'

export enum CancelledTradeReason {
  CONTRACT_SIGNATURE_INDEX_BUMP = 'contract_signature_index_bump'
}

export enum CancelledTradeType {
  BID = 'bid',
  PUBLIC_NFT_ORDER = 'public_nft_order',
  PUBLIC_ITEM_ORDER = 'public_item_order'
}

export type CancelledTrade = {
  id: string
  type: CancelledTradeType
  network: Network
  chainId: ChainId
  contract: string
  reason: CancelledTradeReason
  createdAt: number
  expiresAt: number
  cancelledAt: number
  asset: {
    contractAddress: string
    tokenId: string | null
    itemId: string | null
    name: string | null
    image: string | null
  }
  price: {
    assetType: TradeAssetType.ERC20 | TradeAssetType.USD_PEGGED_MANA
    amount: string
  } | null
}

export type CancelledTradesResponse = {
  data: CancelledTrade[]
  total: number
}

export const CANCELLED_TRADES_PAGE_SIZE = 100

export class CancelledTradesAPI extends BaseClient {
  constructor(private readonly signer: string, url: string, config?: BaseClientConfig) {
    super(url, config)
  }

  fetchCancelledTrades = (reason: CancelledTradeReason, first = CANCELLED_TRADES_PAGE_SIZE): Promise<CancelledTradesResponse> => {
    const params = new URLSearchParams({ reason, first: first.toString() })
    return this.fetch<CancelledTradesResponse>(`/v1/cancelled-trades?${params.toString()}`, {
      method: 'GET',
      metadata: { signer: this.signer }
    })
  }
}
