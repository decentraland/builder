import { call, put, select, takeEvery } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { WorldsWalletStats, content as WorldsAPIContent } from 'lib/api/worlds'
import {
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  FetchWalletWorldsStatsRequestAction,
  fetchWorldsWalletStatsFailure,
  fetchWorldsWalletStatsRequest,
  fetchWorldsWalletStatsSuccess
} from './actions'
import { CLEAR_DEPLOYMENT_SUCCESS, DEPLOY_TO_WORLD_SUCCESS } from 'modules/deployment/actions'

export function* worldsSaga() {
  yield takeEvery(FETCH_WORLDS_WALLET_STATS_REQUEST, handlefetchWorldsWalletStatsRequest)
  yield takeEvery(
    [CONNECT_WALLET_SUCCESS, DEPLOY_TO_WORLD_SUCCESS, CLEAR_DEPLOYMENT_SUCCESS],
    handleActionsThatTriggerFetchWorldsWalletStatsRequest
  )
}

function* handlefetchWorldsWalletStatsRequest(action: FetchWalletWorldsStatsRequestAction) {
  const { address } = action.payload

  try {
    const stats: WorldsWalletStats | null = yield call([WorldsAPIContent, WorldsAPIContent.fetchWalletStats], address)

    if (!stats) {
      throw new Error('Could not fetch wallet stats')
    }

    yield put(fetchWorldsWalletStatsSuccess(address, stats))
  } catch (e) {
    yield put(fetchWorldsWalletStatsFailure(address, isErrorWithMessage(e) ? e.message : 'Unknown'))
  }
}

function* handleActionsThatTriggerFetchWorldsWalletStatsRequest() {
  const address: string | undefined = yield select(getAddress)

  if (!address) {
    return
  }

  yield put(fetchWorldsWalletStatsRequest(address))
}
