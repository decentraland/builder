import { all } from 'redux-saga/effects'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'

import {  MANA_ADDRESS } from 'modules/common/contracts'

const baseWalletSaga = createWalletSaga({
  MANA_ADDRESS
})

export function* walletSaga() {
  yield all([baseWalletSaga()])
}