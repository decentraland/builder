import { builder } from 'lib/api/builder'
import { call, put, takeLatest } from 'redux-saga/effects'
import { fetchSceneStatsFailure, FetchSceneStatsRequestAction, fetchSceneStatsSuccess, FETCH_SCENE_STATS_REQUEST } from './action'
import { WeeklyStats } from './types'

export function* statsSaga() {
  yield takeLatest(FETCH_SCENE_STATS_REQUEST, handleFetchSceneStatsRequest)
}

function* handleFetchSceneStatsRequest(action: FetchSceneStatsRequestAction) {
  const { base } = action.payload
  try {
    const stats: WeeklyStats = yield call(() => builder.getWeeklyStats(base))
    yield put(fetchSceneStatsSuccess(base, stats))
  } catch (error) {
    yield put(fetchSceneStatsFailure(base, error.message))
  }
}
