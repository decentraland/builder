import { call, takeEvery, takeLatest } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { FetchCollectionSuccessAction, FETCH_COLLECTION_SUCCESS } from 'modules/collection/actions'
import { CollectionType } from 'modules/collection/types'
import { getCollectionType } from 'modules/collection/utils'
import { put } from 'redux-saga-test-plan/matchers'
import {
  fetchItemCurationsFailure,
  fetchItemCurationsRequest,
  FetchItemCurationsRequestAction,
  fetchItemCurationsSuccess,
  FETCH_ITEM_CURATIONS_REQUEST
} from './actions'
import { ItemCuration } from './types'

export function* itemCurationSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_ITEM_CURATIONS_REQUEST, handleFetchItemCurationsRequest)
  yield takeLatest(FETCH_COLLECTION_SUCCESS, handleFetchCollectionItemCurations)

  function* handleFetchCollectionItemCurations(action: FetchCollectionSuccessAction) {
    const { collection } = action.payload
    if (getCollectionType(collection) === CollectionType.THIRD_PARTY) {
      yield put(fetchItemCurationsRequest(collection.id))
    }
  }

  function* handleFetchItemCurationsRequest(action: FetchItemCurationsRequestAction) {
    const { collectionId } = action.payload
    try {
      const curations: ItemCuration[] = yield call([builder, builder.fetchItemCurations], collectionId)
      yield put(fetchItemCurationsSuccess(collectionId, curations))
    } catch (error) {
      yield put(fetchItemCurationsFailure(error.message))
    }
  }
}
