import { call, takeEvery } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { put } from 'redux-saga-test-plan/matchers'
import {
  fetchCurationsFailure,
  fetchCurationsSuccess,
  FETCH_CURATIONS_REQUEST,
  pushCurationFailure,
  PushCurationRequestAction,
  pushCurationSuccess,
  PUSH_CURATION_REQUEST,
  PUSH_CURATION_SUCCESS
} from './actions'
import { Curation } from './types'

export function* curationSaga(builder: BuilderAPI) {
  yield takeEvery([FETCH_CURATIONS_REQUEST, PUSH_CURATION_SUCCESS], handleFetchCurationsRequest)
  yield takeEvery(PUSH_CURATION_REQUEST, handlePushCurationRequest)

  function* handleFetchCurationsRequest() {
    try {
      const curations: Curation[] = yield call(() => builder.fetchCurations())
      yield put(fetchCurationsSuccess(curations))
    } catch (error) {
      yield put(fetchCurationsFailure(error.message))
    }
  }

  function* handlePushCurationRequest(action: PushCurationRequestAction) {
    try {
      yield call(() => builder.pushCuration(action.payload.collectionId))
      yield put(pushCurationSuccess())
    } catch (error) {
      yield put(pushCurationFailure(error.message))
    }
  }
}
