import BN from 'bn.js'
import { ThirdPartyItemTier } from './types'

export const sortTiers = (a: ThirdPartyItemTier, b: ThirdPartyItemTier) => {
  if (new BN(a.value).lt(new BN(b.value))) {
    return -1
  } else if (new BN(a.value).gt(new BN(b.value))) {
    return 1
  }
  return 0
}
