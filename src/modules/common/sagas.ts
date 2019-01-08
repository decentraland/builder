import { all } from 'redux-saga/effects'

import { walletSaga } from 'modules/wallet/sagas'
import { translationSaga } from 'modules/translation/sagas'
import { assetPackSaga } from 'modules/assetPack/sagas'
import { sceneSaga } from 'modules/scene/sagas'
import { editorSaga } from 'modules/editor/sagas'

export function* rootSaga() {
  yield all([translationSaga(), walletSaga(), assetPackSaga(), sceneSaga(), editorSaga()])
}
