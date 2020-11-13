import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { call, select } from 'redux-saga/effects'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { createEth } from 'decentraland-dapps/dist/lib/eth'

export function* getCurrentAddress() {
  const eth: Eth | null = yield call(createEth)
  if (!eth) {
    throw new Error('Wallet not found')
  }

  const currentAddress: string = yield select(getAddress)
  if (!currentAddress) {
    throw new Error(`Invalid from address: ${currentAddress}`)
  }

  return [Address.fromString(currentAddress), eth] as const
}
