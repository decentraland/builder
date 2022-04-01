import { call, takeEvery, takeLatest } from '@redux-saga/core/effects'
import { select } from 'redux-saga/effects'
import { BuilderAPI } from 'lib/api/builder'
import { getCollection } from 'modules/collection/selectors'
import { Collection, CollectionType } from 'modules/collection/types'
import { FetchCollectionItemsSuccessAction, FETCH_COLLECTION_ITEMS_SUCCESS } from 'modules/item/actions'
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
  yield takeLatest(FETCH_COLLECTION_ITEMS_SUCCESS, handleFetchCollectionItemCurations)

  function* handleFetchCollectionItemCurations(action: FetchCollectionItemsSuccessAction) {
    const { indexedByField, items } = action.payload
    const collection: Collection = yield select(getCollection, indexedByField)
    if (getCollectionType(collection) === CollectionType.THIRD_PARTY) {
      yield put(fetchItemCurationsRequest(collection.id, items))
    }
  }

  function* handleFetchItemCurationsRequest(action: FetchItemCurationsRequestAction) {
    const { collectionId, items } = action.payload
    try {
      const curations: ItemCuration[] = yield call(
        [builder, builder.fetchItemCurations],
        collectionId,
        items?.map(item => item.id)
      )
      yield put(fetchItemCurationsSuccess(collectionId, curations))
    } catch (error) {
      yield put(fetchItemCurationsFailure(error.message))
    }
  }
}
