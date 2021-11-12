import { Network } from '@dcl/schemas'
import { RootState } from 'modules/common/types'
import { getNetworks } from 'decentraland-dapps/dist/modules/wallet/selectors'

export function getManaBalanceForNetwork(state: RootState, network: Network): number {
  const networks = getNetworks(state)
  return networks && networks[network] && networks[network].mana ? networks[network].mana : 0
}
