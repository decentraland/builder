import BN from 'bn.js'
import { BigNumber } from '@ethersproject/bignumber'
import { extractThirdPartyId } from 'lib/urn'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { ThirdParty } from './types'

export const MAX_PUBLISH_ITEM_COUNT = 20

export function isUserManagerOfThirdParty(address: string, thirdParty: ThirdParty): boolean {
  return thirdParty.managers.map(manager => manager.toLowerCase()).includes(address.toLowerCase())
}

export const getAvailableSlots = (thirdParty: ThirdParty): BN => new BN(thirdParty.maxItems).sub(new BN(thirdParty.totalItems))

export const getThirdPartyForCollection = (thirdParties: Record<string, ThirdParty>, collection: Collection): ThirdParty | undefined =>
  thirdParties[extractThirdPartyId(collection.urn)]

export const getThirdPartyForItem = (thirdParties: Record<string, ThirdParty>, item: Item): ThirdParty | undefined =>
  item.urn ? thirdParties[extractThirdPartyId(item.urn)] : undefined

export function applySlotBuySlippage(cost: BigNumber) {
  return cost.mul(103).div(100)
}
