import { call, select } from 'redux-saga/effects'
import { Address } from 'web3x-es/address'
import { Eth } from 'web3x-es/eth'
import { TxSend } from 'web3x-es/contract'
import { LegacyProviderAdapter } from 'web3x-es/providers'
import { env } from 'decentraland-commons'
import { ContractData, sendMetaTransaction } from 'decentraland-transactions'
import { getNetworkProvider, getConnectedProvider } from 'decentraland-dapps/dist/lib/eth'
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

export function* sendWalletMetaTransaction(contract: ContractData, method: TxSend<any>) {
  const [wallet, eth]: [Wallet, Eth] = yield call(getWallet)
  const from = Address.fromString(wallet.address)
  const provider = eth.provider

  const metaTxProvider: Provider = yield call(() => getNetworkProvider(contract.chainId))
  const txData = getMethodData(method, from)

  console.log('TRANSACTIONS_API_URL', TRANSACTIONS_API_URL)
  const txHash: string = yield call(() =>
    sendMetaTransaction(provider, metaTxProvider, txData, contract, { serverURL: TRANSACTIONS_API_URL })
  )
  return txHash
}

export function getMethodData(method: TxSend<any>, from: Address): string {
  const payload = method.getSendRequestPayload({ from })
  return payload.params[0].data
}
