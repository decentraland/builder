import { call, put, takeEvery } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS, ConnectWalletSuccessAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddressOrWaitConnection } from 'modules/wallet/utils'
import { WorldsWalletStats, content as WorldsAPIContent } from 'lib/api/worlds'
import {
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  FetchWalletWorldsStatsRequestAction,
  fetchWorldsWalletStatsFailure,
  fetchWorldsWalletStatsRequest,
  fetchWorldsWalletStatsSuccess
} from './actions'

export function* worldsSaga() {
  yield takeEvery(FETCH_WORLDS_WALLET_STATS_REQUEST, handlefetchWorldsWalletStatsRequest)
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWallet)
}

function* handlefetchWorldsWalletStatsRequest(action: FetchWalletWorldsStatsRequestAction) {
  const address = action.payload.address ?? (yield call(getAddressOrWaitConnection))

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

function* handleConnectWallet(action: ConnectWalletSuccessAction) {
  yield put(fetchWorldsWalletStatsRequest(action.payload.wallet.address))
}
