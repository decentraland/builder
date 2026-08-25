import { Trade } from '@dcl/schemas'
import { TradeService } from 'decentraland-dapps/dist/modules/trades/TradeService'
import { config } from '../../config'
import { isUSDPeggedTradeAsset } from '../../lib/credits'

/**
 * How a published item's `price` field is denominated.
 *
 * `fetchCollectionItemsRequest` overwrites the builder item's price with the marketplace's
 * `/items` price, which is a bare wei string with no unit attached — and `Item` in `@dcl/schemas`
 * carries no denomination flag (verified against 26.0.0 and 27.0.0). The only thing that says which
 * unit an item is priced in is its trade's received asset type, so the trade has to be read to render
 * the price honestly. The builder only ever signs ERC20 (MANA) trades itself; a USD-pegged one on a
 * builder item was created by the shop.
 */
export enum PriceDenomination {
  /** `price` is MANA wei. Render with the MANA glyph. */
  MANA = 'mana',
  /** `price` is USD wei (1e18 = $1). Render in credits. */
  USD_PEGGED = 'usd-pegged'
}

/**
 * Trades are immutable once signed — the signature pins `received`, so the asset type can never
 * change for a given id. That makes an unbounded process-lifetime cache safe, and it keeps a list of
 * rows sharing a trade (or a revisited detail page) down to a single request.
 */
const cache = new Map<string, Promise<PriceDenomination>>()

function buildService(): TradeService {
  // Reading a trade is public, so no identity is needed here — unlike the store's TradeService, which
  // also signs and cancels.
  return new TradeService('dcl:builder', config.get('MARKETPLACE_API'), () => undefined)
}

export function denominationOfTrade(trade: Pick<Trade, 'received'>): PriceDenomination {
  return isUSDPeggedTradeAsset(trade.received?.[0]) ? PriceDenomination.USD_PEGGED : PriceDenomination.MANA
}

/**
 * Resolve how a trade-backed listing is priced. Falls back to MANA when the trade cannot be read:
 * every listing the marketplace itself creates is MANA-denominated, so MANA is the safe default for
 * an unknown, and it keeps a failed request from blanking a price that is almost certainly correct.
 */
export async function fetchTradePriceDenomination(tradeId: string): Promise<PriceDenomination> {
  const cached = cache.get(tradeId)
  if (cached) {
    return cached
  }

  const pending = buildService()
    .fetchTrade(tradeId)
    .then(denominationOfTrade)
    .catch(() => {
      // Do not cache a failure: a transient error should not pin the wrong unit for the session.
      cache.delete(tradeId)
      return PriceDenomination.MANA
    })

  cache.set(tradeId, pending)
  return pending
}

/**
 * Seed the cache for a trade this client just created, so its row renders in the right unit without
 * a fetch. Safe for the same reason the cache is: a signed trade's denomination can never change.
 */
export function primeTradePriceDenominationCache(tradeId: string, denomination: PriceDenomination): void {
  cache.set(tradeId, Promise.resolve(denomination))
}

/** Test seam — the cache is module state, so specs have to be able to empty it. */
export function clearTradePriceDenominationCache(): void {
  cache.clear()
}
