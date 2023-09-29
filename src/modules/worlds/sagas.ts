import { call, put, takeEvery } from 'redux-saga/effects'
import { WorldsWalletStats, content as WorldsAPIContent } from 'lib/api/worlds'
import {
  FETCH_WALLET_WORLDS_STATS_REQUEST,
  FetchWalletWorldsStatsRequestAction,
  fetchWalletWorldsStatsFailure,
  fetchWalletWorldsStatsSuccess
} from './actions'

export function* worldsSaga() {
  yield takeEvery(FETCH_WALLET_WORLDS_STATS_REQUEST, handleFetchWalletWorldsStatsRequest)
}

function* handleFetchWalletWorldsStatsRequest(action: FetchWalletWorldsStatsRequestAction) {
  const { address } = action.payload

  try {
    const stats: WorldsWalletStats | null = yield call([WorldsAPIContent, WorldsAPIContent.fetchWalletStats], address)

    if (!stats) {
      throw new Error('Could not fetch wallet stats')
    }

    yield put(fetchWalletWorldsStatsSuccess(address, stats))
  } catch (e) {
    yield put(fetchWalletWorldsStatsFailure(address, e.message))
  }
}
