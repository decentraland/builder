import BN from 'bn.js'
import { extractThirdPartyId } from 'lib/urn'
import { Collection } from 'modules/collection/types'
import { ThirdParty } from './types'

export function isUserManagerOfThirdParty(address: string, thirdParty: ThirdParty): boolean {
  return thirdParty.managers.map(manager => manager.toLowerCase()).includes(address.toLowerCase())
}

export const getAvailableSlots = (thirdParty: ThirdParty): BN => new BN(thirdParty.maxItems).sub(new BN(thirdParty.totalItems))

export const getThirdPartyOfCollection = (thirdParties: Record<string, ThirdParty>, collection: Collection) =>
  thirdParties[extractThirdPartyId(collection.urn!)]
