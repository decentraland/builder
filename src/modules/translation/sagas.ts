import { put, takeLatest, select } from 'redux-saga/effects'
import { Locale } from 'decentraland-ui'
import { getLocale } from 'decentraland-dapps/dist/modules/translation/selectors'
import { changeLocale, fetchTranslationsRequest } from 'decentraland-dapps/dist/modules/translation/actions'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import { createTranslationSaga } from 'decentraland-dapps/dist/modules/translation/sagas'
import { getPreferredLocale } from 'decentraland-dapps/dist/modules/translation/utils'

import * as languages from './languages'

export function* translationSaga() {
  const mainSaga = createTranslationSaga({ translations: languages as any })

  yield takeLatest(STORAGE_LOAD, handleStorageLoad)
  yield mainSaga() // This should be last
}

function* handleStorageLoad() {
  const currentLocale: Locale = yield select(getLocale)
  const locales = Object.keys(languages)

  const urlParams = new URLSearchParams(window.location.search)
  const localeFromUrl = urlParams.get('locale')

  // Determine the locale to use
  let targetLocale = currentLocale || getPreferredLocale(locales as Locale[]) || locales[0]

  if (localeFromUrl && locales.includes(localeFromUrl)) {
    targetLocale = localeFromUrl as Locale
  }

  // Always fetch translations after storage load
  if (targetLocale !== currentLocale) {
    yield put(changeLocale(targetLocale as Locale))
  } else {
    // If locale hasn't changed, still need to fetch translations
    yield put(fetchTranslationsRequest(targetLocale as Locale))
  }
}
