import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { select } from 'redux-saga/effects'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export function* getCurrentAddress() {
  const eth = Eth.fromCurrentProvider()
  if (!eth) {
    throw new Error('Wallet not found')
  }

  const currentAddress: string = yield select(getAddress)
  if (!currentAddress) {
    throw new Error(`Invalid from address: ${currentAddress}`)
  }

  return [Address.fromString(currentAddress), eth] as const
}
