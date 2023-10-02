import { call, put, select, takeEvery } from 'redux-saga/effects'
import { WorldsWalletStats, content as WorldsAPIContent } from 'lib/api/worlds'
import {
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  FetchWalletWorldsStatsRequestAction,
  fetchWorldsWalletStatsFailure,
  fetchWorldsWalletStatsSuccess
} from './actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export function* worldsSaga() {
  yield takeEvery(FETCH_WORLDS_WALLET_STATS_REQUEST, handlefetchWorldsWalletStatsRequest)
}

function* handlefetchWorldsWalletStatsRequest(action: FetchWalletWorldsStatsRequestAction) {
  let address = action.payload.address

  if (!address) {
    address = yield select(getAddress)
  }

  try {
    if (!address) {
      throw new Error('An address is required')
    }

    const stats: WorldsWalletStats | null = yield call([WorldsAPIContent, WorldsAPIContent.fetchWalletStats], address)

    if (!stats) {
      throw new Error('Could not fetch wallet stats')
    }

    yield put(fetchWorldsWalletStatsSuccess(address, stats))
  } catch (e) {
    yield put(fetchWorldsWalletStatsFailure(e.message, address))
  }
}
