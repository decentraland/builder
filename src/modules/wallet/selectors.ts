import { RootState } from 'modules/common/types'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'

export function getManaBalance(state: RootState): number {
  const wallet = getWallet(state)

  return wallet ? wallet.networks.MATIC.mana : 0
}
