import { all, call } from 'redux-saga/effects'
import { env } from 'decentraland-commons'
import { eth } from 'decentraland-eth'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { MANAToken } from 'modules/common/contracts'
import { stringToHex } from './utils'

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
    throw new Error(t('@dapps.sign_in.error'))
  }

  try {
    debugger
    console.log(stringToHex(msg))
    return yield call(() => eth.wallet.sign(stringToHex(msg)))
  } catch (e) {
    throw new Error(t('wallet.signature_error'))
  }
}
