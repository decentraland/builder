import { call, select } from 'redux-saga/effects'
import { Address } from 'web3x-es/address'
import { Eth } from 'web3x-es/eth'
import { TxSend } from 'web3x-es/contract'
import { LegacyProviderAdapter } from 'web3x-es/providers'
import { ContractName, getContract, sendMetaTransaction } from 'decentraland-transactions'
import { createProvider, getConnectedProvider, Provider } from 'decentraland-dapps/dist/lib/eth'
import { ProviderType, Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { getData as getBaseWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'

export async function getEth(): Promise<Eth> {
  const provider: Provider | null = await getConnectedProvider()
  if (!provider) {
    throw new Error('Could not get a valid connected Wallet')
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

export function* sendWalletMetaTransaction(contractName: ContractName, method: TxSend<any>, address?: string) {
  console.group(`META TX ${contractName}`)
  console.log(`Sending meta transaction for contract ${contractName}. Method`, method)

  const [wallet, eth]: [Wallet, Eth] = yield call(getWallet)
  const provider = eth.provider

  // const provider: Provider | null = yield call(getConnectedProvider)
  // if (!provider) {
  //   throw new Error('Could not get a valid connected Wallet')
  // }

  // const wallet: Wallet | null = yield select(getBaseWallet)
  // if (!wallet) {
  //   throw new Error('Could not get current wallet from state')
  // }

  const from = Address.fromString(wallet.address)
  const chainId = wallet.networks.MATIC.chainId

  const metaTxProvider: Provider = yield call(() => createProvider(ProviderType.NETWORK, chainId))
  const payload = method.getSendRequestPayload({ from })
  const txData = payload.params[0].data

  const contract = getContract(contractName, chainId)
  if (address) {
    contract.address = address
  }

  console.log({
    mainchainId: wallet.chainId,
    maticChainId: chainId
  })

  const txHash = yield call(() => sendMetaTransaction(provider, metaTxProvider, txData, contract))

  console.log(`GOT tx hash ${txHash}`)
  console.groupEnd()
  return txHash
}
