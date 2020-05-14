import { takeLatest, call, put } from 'redux-saga/effects'
import { FETCH_LAND_REQUEST, FetchLandRequestAction, fetchLandFailure, fetchLandSuccess, fetchLandRequest } from './actions'
import { Land } from './types'
import { manager } from 'lib/api/manager'
import {
  CONNECT_WALLET_SUCCESS,
  CHANGE_ACCOUNT,
  ConnectWalletSuccessAction,
  ChangeAccountAction
} from 'decentraland-dapps/dist/modules/wallet/actions'

export function* landSaga() {
  yield takeLatest(FETCH_LAND_REQUEST, handleFetchLandRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleWallet)
  yield takeLatest(CHANGE_ACCOUNT, handleWallet)
}

function* handleFetchLandRequest(action: FetchLandRequestAction) {
  const { address } = action.payload
  try {
    const land: Land[] = yield call(() => manager.fetchLand(address))
    yield put(fetchLandSuccess(address, land))
  } catch (error) {
    yield put(fetchLandFailure(address, error.message))
  }
}

function* handleWallet(action: ConnectWalletSuccessAction | ChangeAccountAction) {
  const { address } = action.payload.wallet
  yield put(fetchLandRequest(address))
}
