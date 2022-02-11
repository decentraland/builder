import { call, takeEvery } from '@redux-saga/core/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { BuilderAPI } from 'lib/api/builder'
import { put } from 'redux-saga-test-plan/matchers'
import {
  approveCollectionCurationFailure,
  ApproveCollectionCurationRequestAction,
  approveCollectionCurationSuccess,
  APPROVE_COLLECTION_CURATION_REQUEST,
  fetchCollectionCurationFailure,
  fetchCollectionCurationRequest,
  FetchCollectionCurationRequestAction,
  fetchCollectionCurationsFailure,
  fetchCollectionCurationsRequest,
  fetchCollectionCurationsSuccess,
  fetchCollectionCurationSuccess,
  FETCH_COLLECTION_CURATIONS_REQUEST,
  FETCH_COLLECTION_CURATION_REQUEST,
  pushCollectionCurationFailure,
  PushCollectionCurationRequestAction,
  pushCollectionCurationSuccess,
  PUSH_COLLECTION_CURATION_REQUEST,
  rejectCollectionCurationFailure,
  RejectCollectionCurationRequestAction,
  rejectCollectionCurationSuccess,
  REJECT_COLLECTION_CURATION_REQUEST
} from './actions'
import { CollectionCuration, CurationStatus } from './types'

export function* curationSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_COLLECTION_CURATIONS_REQUEST, handleFetchCurationsRequest)
  yield takeEvery(PUSH_COLLECTION_CURATION_REQUEST, handlePushCurationRequest)
  yield takeEvery(FETCH_COLLECTION_CURATION_REQUEST, handleFetchCurationRequest)
  yield takeEvery(APPROVE_COLLECTION_CURATION_REQUEST, handleApproveCurationRequest)
  yield takeEvery(REJECT_COLLECTION_CURATION_REQUEST, handleRejectCurationRequest)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)

  function* handleFetchCurationsRequest() {
    try {
      const curations: CollectionCuration[] = yield call([builder, builder.fetchCurations])
      yield put(fetchCollectionCurationsSuccess(curations))
    } catch (error) {
      yield put(fetchCollectionCurationsFailure(error.message))
    }
  }

  function* handleFetchCurationRequest(action: FetchCollectionCurationRequestAction) {
    try {
      const { collectionId } = action.payload
      const curation: CollectionCuration | undefined = yield call([builder, builder.fetchCuration], collectionId)
      yield put(fetchCollectionCurationSuccess(collectionId, curation))
    } catch (error) {
      yield put(fetchCollectionCurationFailure(error.message))
    }
  }

  function* handlePushCurationRequest(action: PushCollectionCurationRequestAction) {
    const { collectionId } = action.payload

    try {
      yield call([builder, builder.pushCuration], collectionId)
      yield put(pushCollectionCurationSuccess())
      yield put(fetchCollectionCurationRequest(collectionId))
    } catch (error) {
      yield put(pushCollectionCurationFailure(error.message))
    }
  }

  function* handleApproveCurationRequest(action: ApproveCollectionCurationRequestAction) {
    const { collectionId } = action.payload
    try {
      yield call([builder, 'updateCurationStatus'], collectionId, CurationStatus.APPROVED)
      yield put(approveCollectionCurationSuccess(collectionId))
    } catch (error) {
      yield put(approveCollectionCurationFailure(collectionId, error.message))
    }
  }

  function* handleRejectCurationRequest(action: RejectCollectionCurationRequestAction) {
    const { collectionId } = action.payload
    try {
      yield call([builder, 'updateCurationStatus'], collectionId, CurationStatus.REJECTED)
      yield put(rejectCollectionCurationSuccess(collectionId))
    } catch (error) {
      yield put(rejectCollectionCurationFailure(collectionId, error.message))
    }
  }

  function* handleConnectWalletSuccess() {
    yield put(fetchCollectionCurationsRequest())
  }
}
