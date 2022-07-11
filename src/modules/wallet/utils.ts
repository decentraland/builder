import { select } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { getConnectedProvider } from 'decentraland-dapps/dist/lib/eth'
import { Wallet, Provider } from 'decentraland-dapps/dist/modules/wallet/types'
import { getData as getBaseWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { config } from 'config'

export const TRANSACTIONS_API_URL = config.get('TRANSACTIONS_API_URL')

export async function getEth(): Promise<ethers.providers.Web3Provider> {
  const provider: Provider | null = await getConnectedProvider()

  if (!provider) {
    throw new Error('Could not get a valid connected Wallet')
  }

  return new ethers.providers.Web3Provider(provider)
}

export function* getWallet() {
  const wallet: Wallet | null = yield select(getBaseWallet)
  if (!wallet) {
    throw new Error('Could not get current wallet from state')
  }

  return wallet
}

export async function getMethodData(populatedTransactionPromise: Promise<ethers.PopulatedTransaction>) {
  const populatedTransaction = await populatedTransactionPromise
  return populatedTransaction.data!
}
