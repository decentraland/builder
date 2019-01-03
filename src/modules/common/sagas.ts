import { all } from 'redux-saga/effects'

import { walletSaga } from 'modules/wallet/sagas'

import { createTranslationSaga } from 'decentraland-dapps/dist/modules/translation/sagas'
import * as translations from 'translations/lang'

export const translationSaga = createTranslationSaga({
  translations
})

export function* rootSaga() {
  yield all([translationSaga(), walletSaga()])
}
