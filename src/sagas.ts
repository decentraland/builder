import { all } from 'redux-saga/effects'

import { transactionSaga } from 'decentraland-dapps/dist/modules/transaction/sagas'
import { createTranslationSaga } from 'decentraland-dapps/dist/modules/translation/sagas'
import * as translations from './translations'

export const translationSaga = createTranslationSaga({
  translations
})

export function* rootSaga() {
  yield all([translationSaga()])
}
