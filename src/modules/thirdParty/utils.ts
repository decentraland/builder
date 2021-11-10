import { ThirdParty } from './types'

export function isUserManagerOfThirdParty(wallet: string, thirdParty: ThirdParty): boolean {
  return thirdParty.managers.map(manager => manager.toLowerCase()).includes(wallet.toLowerCase())
}
