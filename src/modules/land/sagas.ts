import { takeLatest, call, put, takeEvery } from 'redux-saga/effects'
import { FETCH_LANDS_REQUEST, FetchLandsRequestAction, fetchLandsFailure, fetchLandsSuccess, fetchLandsRequest } from './actions'
import { Land } from './types'
import { manager } from 'lib/api/manager'
import {
  CONNECT_WALLET_SUCCESS,
  CHANGE_ACCOUNT,
  ConnectWalletSuccessAction,
  ChangeAccountAction
} from 'decentraland-dapps/dist/modules/wallet/actions'

export function* landSaga() {
  yield takeEvery(FETCH_LANDS_REQUEST, handleFetchLandRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleWallet)
  yield takeLatest(CHANGE_ACCOUNT, handleWallet)
}

function* handleFetchLandRequest(action: FetchLandsRequestAction) {
  const { address } = action.payload
  try {
    const land: Land[] = yield call(() => manager.fetchLand(address))
    yield put(fetchLandsSuccess(address, land))
  } catch (error) {
    yield put(fetchLandsFailure(address, error.message))
  }
}

function* handleWallet(action: ConnectWalletSuccessAction | ChangeAccountAction) {
  const { address } = action.payload.wallet
  yield put(fetchLandsRequest(address))
}
