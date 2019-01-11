import { all } from 'redux-saga/effects'
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
