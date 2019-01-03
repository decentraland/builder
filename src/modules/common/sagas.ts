import { all } from 'redux-saga/effects'

import { walletSaga } from 'modules/wallet/sagas'
import { translationSaga } from 'modules/translation/sagas'

export function* rootSaga() {
  yield all([translationSaga(), walletSaga()])
}
