import { takeEvery, call, put, takeLatest } from 'redux-saga/effects'
import {
  FETCH_COLLECTIONS_REQUEST,
  FetchCollectionsRequestAction,
  fetchCollectionsSuccess,
  fetchCollectionsFailure,
  SaveCollectionRequestAction,
  saveCollectionSuccess,
  saveCollectionFailure,
  SAVE_COLLECTION_REQUEST,
  fetchCollectionsRequest
} from './actions'
import { builder } from 'lib/api/builder'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'

export function* collectionSaga() {
  yield takeEvery(FETCH_COLLECTIONS_REQUEST, handleFetchCollectionsRequest)
  yield takeEvery(SAVE_COLLECTION_REQUEST, handleSaveCollectionRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
}

function* handleFetchCollectionsRequest(_action: FetchCollectionsRequestAction) {
  try {
    const collections = yield call(() => builder.fetchCollections())
    yield put(fetchCollectionsSuccess(collections))
  } catch (error) {
    yield put(fetchCollectionsFailure(error.message))
  }
}

function* handleSaveCollectionRequest(action: SaveCollectionRequestAction) {
  const { collection } = action.payload
  try {
    yield call(() => builder.saveCollection(collection))
    yield put(saveCollectionSuccess(collection))
  } catch (error) {
    yield put(saveCollectionFailure(collection, error.message))
  }
}

function* handleConnectWalletSuccess() {
  yield put(fetchCollectionsRequest())
}
