import { call, select } from 'redux-saga/effects'
import { PopulatedTransaction } from 'ethers'
import { Eth } from 'web3x/eth'
import { LegacyProviderAdapter } from 'web3x/providers'
import { env } from 'decentraland-commons'
import { getConnectedProvider } from 'decentraland-dapps/dist/lib/eth'
import { Wallet, Provider } from 'decentraland-dapps/dist/modules/wallet/types'
import { getData as getBaseWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'

export const TRANSACTIONS_API_URL = env.get<string | undefined>('REACT_APP_TRANSACTIONS_API_URL')

export async function getEth(): Promise<Eth> {
  const provider: Provider | null = await getConnectedProvider()
  if (!provider) {
    throw new Error('Could not get a valid connected Wallet')
  }

  return new Eth(new LegacyProviderAdapter(provider as any))
}

export function* getWallet() {
  const eth: Eth = yield call(getEth)

  const wallet: Wallet | null = yield select(getBaseWallet)
  if (!wallet) {
    throw new Error('Could not get current wallet from state')
  }

  return [wallet, eth]
}

export async function getMethodData(populatedTransactionPromise: Promise<PopulatedTransaction>) {
  const populatedTransaction = await populatedTransactionPromise
  return populatedTransaction.data!
}
