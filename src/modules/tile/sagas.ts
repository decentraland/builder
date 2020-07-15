import { takeEvery, call, put } from 'redux-saga/effects'
import { Atlas } from 'decentraland-ui'
import { FETCH_TILES_REQUEST, FetchTilesRequestAction, fetchTilesSuccess, fetchTilesFailure } from './actions'
import { MARKETPLACE_URL } from 'lib/api/marketplace'

export function* tileSaga() {
  yield takeEvery(FETCH_TILES_REQUEST, handleFetchTilesRequest)
}

function* handleFetchTilesRequest(_action: FetchTilesRequestAction) {
  try {
    const tiles = yield call(() => Atlas.fetchTiles(MARKETPLACE_URL + '/tiles'))
    yield put(fetchTilesSuccess(tiles))
  } catch (error) {
    yield put(fetchTilesFailure(error.message))
  }
}
