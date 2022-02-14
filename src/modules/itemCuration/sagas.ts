import { call, takeEvery } from '@redux-saga/core/effects'
import { BuilderAPI } from 'lib/api/builder'
import { put } from 'redux-saga-test-plan/matchers'
import {
  fetchItemCurationsFailure,
  FetchItemCurationsRequestAction,
  fetchItemCurationsSuccess,
  FETCH_ITEM_CURATIONS_REQUEST
} from './actions'
import { ItemCuration } from './types'

export function* itemCurationSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_ITEM_CURATIONS_REQUEST, handleFetchItemCurationsRequest)

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
