import { call, put, race, select, take, takeEvery } from 'redux-saga/effects'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import {
  CONNECT_WALLET_FAILURE,
  CONNECT_WALLET_SUCCESS,
  ConnectWalletFailureAction,
  ConnectWalletSuccessAction
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { WorldsWalletStats, content as WorldsAPIContent } from 'lib/api/worlds'
import {
  FETCH_WORLDS_WALLET_STATS_REQUEST,
  FetchWalletWorldsStatsRequestAction,
  fetchWorldsWalletStatsFailure,
  fetchWorldsWalletStatsSuccess
} from './actions'

export function* worldsSaga() {
  yield takeEvery(FETCH_WORLDS_WALLET_STATS_REQUEST, handlefetchWorldsWalletStatsRequest)
}

/**
 * Handle the fetch of the provided or current user's wallet stats.
 * If no address is provided through the action, the wallet address from the currently connected wallet will be used.
 * This saga is intended to be used without providing an address only if a wallet is connected or connecting.
 * If called without a connected wallet and providing no address, it will get stuck until a wallet is connected.
 */
function* handlefetchWorldsWalletStatsRequest(action: FetchWalletWorldsStatsRequestAction) {
  let address = action.payload.address

  if (!address) {
    address = yield select(getAddress)
  }

  try {
    if (!address) {
      const {
        success
      }: {
        success: ConnectWalletSuccessAction
        failure: ConnectWalletFailureAction
      } = yield race({
        success: take(CONNECT_WALLET_SUCCESS),
        failure: take(CONNECT_WALLET_FAILURE)
      })

      if (success) {
        address = success.payload.wallet.address
      } else {
        throw new Error('An address is required')
      }
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
