import { env } from 'decentraland-commons'
import { takeEvery, call, put } from 'redux-saga/effects'
import { Atlas, AtlasTile } from 'decentraland-ui'
import { FETCH_TILES_REQUEST, FetchTilesRequestAction, fetchTilesSuccess, fetchTilesFailure } from './actions'

export const MARKETPLACE_URL = env.get('REACT_APP_MARKETPLACE_URL', '')

export function* tileSaga() {
  yield takeEvery(FETCH_TILES_REQUEST, handleFetchTilesRequest)
}

function* handleFetchTilesRequest(_action: FetchTilesRequestAction) {
  try {
    const tiles: Record<string, AtlasTile> = yield call(() => Atlas.fetchTiles(MARKETPLACE_URL + '/tiles'))
    yield put(fetchTilesSuccess(tiles))
  } catch (error) {
    yield put(fetchTilesFailure(error.message))
  }
}
