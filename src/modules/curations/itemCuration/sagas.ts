import { call, takeEvery, takeLatest } from '@redux-saga/core/effects'
import PQueue from 'p-queue'
import { BuilderAPI } from 'lib/api/builder'
import { FetchCollectionItemsSuccessAction, FETCH_COLLECTION_ITEMS_SUCCESS } from 'modules/item/actions'
import { isThirdParty } from 'lib/urn'
import { put } from 'redux-saga-test-plan/matchers'
import {
  fetchItemCurationFailure,
  FetchItemCurationRequestAction,
  fetchItemCurationsFailure,
  fetchItemCurationsRequest,
  FetchItemCurationsRequestAction,
  fetchItemCurationsSuccess,
  fetchItemCurationSuccess,
  FETCH_ITEM_CURATIONS_REQUEST,
  FETCH_ITEM_CURATION_REQUEST
} from './actions'
import { ItemCuration } from './types'

const MAX_ITEM_CURATIONS = 30
const REQUESTS_BATCH_SIZE = 10

const chunk = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))

export function* itemCurationSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_ITEM_CURATION_REQUEST, handleFetchItemCurationRequest)
  yield takeEvery(FETCH_ITEM_CURATIONS_REQUEST, handleFetchItemCurationsRequest)
  yield takeLatest(FETCH_COLLECTION_ITEMS_SUCCESS, handleFetchCollectionItemCurations)

  function* handleFetchCollectionItemCurations(action: FetchCollectionItemsSuccessAction) {
    const { items } = action.payload
    const publishedItems = items.filter(item => item.isPublished)
    // the collection fetch is done at the same time of the items fetch, so we might not have the collection data yet
    // so we can infer if the collection is TP by the item.urn
    const isTPCollection = isThirdParty(items[0]?.urn)
    const collectionId = items[0]?.collectionId
    if (collectionId && isTPCollection && publishedItems.length > 0) {
      yield put(
        fetchItemCurationsRequest(
          collectionId,
          items.filter(item => item.isPublished)
        )
      )
    }
  }

  function* handleFetchItemCurationsRequest(action: FetchItemCurationsRequestAction) {
    const { collectionId, items } = action.payload
    try {
      let itemCurations: ItemCuration[] = []
      if (items && items.length > 0) {
        const queue = new PQueue({ concurrency: REQUESTS_BATCH_SIZE })
        const promisesOfCurationsToFetch: (() => Promise<ItemCuration[]>)[] = chunk(items, MAX_ITEM_CURATIONS).map(chunkOfItems => () =>
          builder.fetchItemCurations(
            collectionId,
            chunkOfItems.map(item => item.id)
          )
        )

        const allChunkedCurations: ItemCuration[][] = yield queue.addAll(promisesOfCurationsToFetch)
        itemCurations = allChunkedCurations.flat()
      }

      yield put(fetchItemCurationsSuccess(collectionId, itemCurations))
    } catch (error) {
      yield put(fetchItemCurationsFailure(error.message))
    }
  }

  function* handleFetchItemCurationRequest(action: FetchItemCurationRequestAction) {
    const { collectionId, itemId } = action.payload
    try {
      const curation: ItemCuration = yield call([builder, builder.fetchItemCuration], itemId)
      yield put(fetchItemCurationSuccess(collectionId, curation))
    } catch (error) {
      yield put(fetchItemCurationFailure(error.message))
    }
  }
}
