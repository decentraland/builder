import { call, put, takeEvery } from 'redux-saga/effects'
import { analytics } from 'lib/api/analytics'
import {
  fetchWeeklySceneStatsFailure,
  FetchWeeklySceneStatsRequestAction,
  fetchWeeklySceneStatsSuccess,
  FETCH_WEEKLY_SCENE_STATS_REQUEST
} from './action'
import { WeeklyStats } from './types'

export function* statsSaga() {
  yield takeEvery(FETCH_WEEKLY_SCENE_STATS_REQUEST, handleFetchSceneStatsRequest)

  function* handleFetchSceneStatsRequest(action: FetchWeeklySceneStatsRequestAction) {
    const { base } = action.payload
    try {
      const stats: WeeklyStats = yield call(() => analytics.fetchWeeklyStats(base))
      yield put(fetchWeeklySceneStatsSuccess(base, stats))
    } catch (error) {
      yield put(fetchWeeklySceneStatsFailure(base, error.message))
    }
  }
}
