import { all, call } from 'redux-saga/effects'
import { env } from 'decentraland-commons'
import { eth } from 'decentraland-eth'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'

import { MANAToken } from 'modules/common/contracts'

const baseWalletSaga = createWalletSaga({
  provider: env.get('REACT_APP_PROVIDER_URL'),
  contracts: [MANAToken],
  eth
})

export function* walletSaga() {
  yield all([baseWalletSaga()])
}

export function* signMessage(msg: string) {
  if (!eth.wallet) {
    throw new Error('Unable to connect to wallet')
  }

  try {
    return yield call(() => eth.wallet.sign(msg))
  } catch (e) {
    throw new Error('Failed to sign message')
  }
}
