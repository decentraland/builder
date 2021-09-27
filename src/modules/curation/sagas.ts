import { call, takeEvery } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { put } from 'redux-saga-test-plan/matchers'
import { fetchCurationsFailure, fetchCurationsSuccess, FETCH_CURATIONS_REQUEST } from './actions'
import { Curation } from './types'

export function* curationSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_CURATIONS_REQUEST, handleFetchCurationsRequest)

  function* handleFetchCurationsRequest() {
    try {
      const curations: Curation[] = yield call(() => builder.fetchCurations())
      yield put(fetchCurationsSuccess(curations))
    } catch (error) {
      yield put(fetchCurationsFailure(error.message))
    }
  }
}
