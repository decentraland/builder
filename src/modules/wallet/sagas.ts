import { all, call } from 'redux-saga/effects'
import { Eth } from 'web3x-es/eth';
import { Address } from 'web3x-es/address';
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import {  MANA_ADDRESS } from 'modules/common/contracts'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors';
import { store } from 'modules/common/store';

const web3 = (window as any).web3

const baseWalletSaga = createWalletSaga({
  MANA_ADDRESS
})

export function* walletSaga() {
  yield all([baseWalletSaga()])
}

export function* signMessage(msg: string) {

  const eth = Eth.fromCurrentProvider()

  if (!eth) {
    debugger
    throw new Error(t('wallet.no_wallet'))
  }

  const provider = (window as any).ethereum
  if (provider && provider.enable) {
    yield call(() => provider.enable())
  }

  const address = getAddress(store.getState())

  if (!address) {
    debugger
    throw new Error(t('wallet.not_connnected'))
  }

  try {
    return yield call(() => eth.sign(Address.fromString(address), web3.toHex(msg)))
  } catch (e) {
    debugger
    throw new Error(t('wallet.signature_error'))
  }
}
