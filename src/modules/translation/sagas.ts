import { put, takeLatest, select } from 'redux-saga/effects'
import { Locale } from 'decentraland-ui'
import { getLocale } from 'decentraland-dapps/dist/modules/translation/selectors'
import { changeLocale } from 'decentraland-dapps/dist/modules/translation/actions'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import { createTranslationSaga } from 'decentraland-dapps/dist/modules/translation/sagas'

import * as languages from './languages'

export function* translationSaga() {
  const mainSaga = createTranslationSaga({ translations: languages })

  yield takeLatest(STORAGE_LOAD, handleStorageLoad)
  yield mainSaga() // This should be last
}

function* handleStorageLoad() {
  const currentLocale: Locale = yield select(getLocale)

  const urlParams = new URLSearchParams(window.location.search)
  const locale = urlParams.get('locale')
  const locales = Object.keys(languages)

  if (locale && locale !== currentLocale && locales.includes(locale)) {
    yield put(changeLocale(locale as Locale))
  }
}
