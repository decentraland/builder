import { BuilderAPI } from 'lib/api/builder'
import { call, put, takeEvery } from 'redux-saga/effects'
import {
  fetchWeeklySceneStatsFailure,
  FetchWeeklySceneStatsRequestAction,
  fetchWeeklySceneStatsSuccess,
  FETCH_WEEKLY_SCENE_STATS_REQUEST
} from './action'
import { WeeklyStats } from './types'

export function* statsSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_WEEKLY_SCENE_STATS_REQUEST, handleFetchSceneStatsRequest)

  function* handleFetchSceneStatsRequest(action: FetchWeeklySceneStatsRequestAction) {
    const { base } = action.payload
    try {
      const stats: WeeklyStats = yield call(() => builder.fetchWeeklyStats(base))
      yield put(fetchWeeklySceneStatsSuccess(base, stats))
    } catch (error) {
      yield put(fetchWeeklySceneStatsFailure(base, error.message))
    }
  }
}
