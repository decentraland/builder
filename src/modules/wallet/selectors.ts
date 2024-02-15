import { Network } from '@dcl/schemas'
import { createSelector } from 'reselect'
import { getData, getNetworks } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { RootState } from 'modules/common/types'

export function getManaBalanceForNetwork(state: RootState, network: Network): number {
  const networks = getNetworks(state)
  return networks && (network === Network.ETHEREUM || network === Network.MATIC) && networks[network] && networks[network].mana
    ? networks[network].mana
    : 0
}

export const getWallet = createSelector<RootState, Wallet | null, Wallet | null>(getData, wallet =>
  wallet ? { ...wallet, address: wallet.address.toLowerCase() } : null
)
