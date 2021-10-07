import { call, takeEvery } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { put } from 'redux-saga-test-plan/matchers'
import {
  approveCurationFailure,
  ApproveCurationRequestAction,
  approveCurationSuccess,
  APPROVE_CURATION_REQUEST,
  fetchCurationFailure,
  fetchCurationRequest,
  FetchCurationRequestAction,
  fetchCurationsFailure,
  fetchCurationsSuccess,
  fetchCurationSuccess,
  FETCH_CURATIONS_REQUEST,
  FETCH_CURATION_REQUEST,
  pushCurationFailure,
  PushCurationRequestAction,
  pushCurationSuccess,
  PUSH_CURATION_REQUEST,
  rejectCurationFailure,
  RejectCurationRequestAction,
  rejectCurationSuccess,
  REJECT_CURATION_REQUEST
} from './actions'
import { Curation, CurationStatus } from './types'

export function* curationSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_CURATIONS_REQUEST, handleFetchCurationsRequest)
  yield takeEvery(PUSH_CURATION_REQUEST, handlePushCurationRequest)
  yield takeEvery(FETCH_CURATION_REQUEST, handleFetchCurationRequest)
  yield takeEvery(APPROVE_CURATION_REQUEST, handleApproveCurationRequest)
  yield takeEvery(REJECT_CURATION_REQUEST, handleRejectCurationRequest)

  function* handleFetchCurationsRequest() {
    try {
      const curations: Curation[] = yield call([builder, builder.fetchCurations])
      yield put(fetchCurationsSuccess(curations))
    } catch (error) {
      yield put(fetchCurationsFailure(error.message))
    }
  }

  function* handleFetchCurationRequest(action: FetchCurationRequestAction) {
    try {
      const { collectionId } = action.payload
      const curation: Curation | undefined = yield call([builder, builder.fetchCuration], collectionId)
      yield put(fetchCurationSuccess(collectionId, curation))
    } catch (error) {
      yield put(fetchCurationFailure(error.message))
    }
  }

  function* handlePushCurationRequest(action: PushCurationRequestAction) {
    const { collectionId } = action.payload

    try {
      yield call([builder, builder.pushCuration], collectionId)
      yield put(pushCurationSuccess())
      yield put(fetchCurationRequest(collectionId))
    } catch (error) {
      yield put(pushCurationFailure(error.message))
    }
  }

  function* handleApproveCurationRequest(action: ApproveCurationRequestAction) {
    const { collectionId } = action.payload
    try {
      yield call([builder, 'updateCurationStatus'], collectionId, CurationStatus.APPROVED)
      yield put(approveCurationSuccess(collectionId))
    } catch (error) {
      yield put(approveCurationFailure(collectionId, error.message))
    }
  }

  function* handleRejectCurationRequest(action: RejectCurationRequestAction) {
    const { collectionId } = action.payload
    try {
      yield call([builder, 'updateCurationStatus'], collectionId, CurationStatus.REJECTED)
      yield put(rejectCurationSuccess(collectionId))
    } catch (error) {
      yield put(rejectCurationFailure(collectionId, error.message))
    }
  }
}
