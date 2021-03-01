import { call, select } from 'redux-saga/effects'
import { Eth } from 'web3x-es/eth'
import { LegacyProviderAdapter } from 'web3x-es/providers'
import { getData as getBaseWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getConnectedProvider, Provider } from 'decentraland-dapps/dist/lib/eth'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'

export async function getEth(): Promise<Eth> {
  const provider: Provider | null = await getConnectedProvider()

  if (!provider) {
    throw new Error('Wallet not found')
  }

  return new Eth(new LegacyProviderAdapter(provider as any))
}

export function* getWallet() {
  const eth = yield call(getEth)

  const wallet: Wallet | null = yield select(getBaseWallet)
  if (!wallet) {
    throw new Error('Could not get current wallet from state')
  }

  return [wallet, eth]
}
