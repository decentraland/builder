import { Network } from '@dcl/schemas'
import { getNetworks } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'

export function getManaBalanceForNetwork(state: RootState, network: Network): number {
  const networks = getNetworks(state)
  return networks && networks[network] && networks[network].mana ? networks[network].mana : 0
}
