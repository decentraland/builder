import { config } from 'config'

/**
 * Links into the shop — the credits-denominated storefront, a different site from the marketplace.
 *
 * Listing from the builder stays in MANA and settles on the marketplace; a creator who wants to sell for
 * credits does that in the shop. So an item can be on sale in a place this app has, until now, had no way to
 * name: `SHOP_WEB_URL` is a per-environment value precisely so a creator on `.zone` is never handed a
 * production link to their own item.
 */
const SHOP_WEB_URL = config.get('SHOP_WEB_URL', '')

/** The shop's home. Empty string when unconfigured, so callers can hide the link rather than link to nowhere. */
export function shopUrl(): string {
  return SHOP_WEB_URL
}

/**
 * An item's page in the shop, where its credits listing lives.
 *
 * Keyed by (collection contract, item id) — the same pair the shop's own route takes — and NOT by the trade:
 * the page is about the item, and it stays valid when the listing is replaced.
 */
export function shopItemUrl(contractAddress: string, itemId: string): string {
  return SHOP_WEB_URL ? `${SHOP_WEB_URL}/item/${contractAddress}/${itemId}` : ''
}
