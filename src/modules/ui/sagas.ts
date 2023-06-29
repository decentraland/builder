import { all, takeEvery, select, put } from 'redux-saga/effects'
import { getLocation, push } from 'connected-react-router'
import { CONNECT_WALLET_SUCCESS, ConnectWalletSuccessAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { dashboardSaga } from './dashboard/sagas'
import { locations } from 'routing/locations'

export function* uiSaga() {
  yield all([dashboardSaga()])
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
}

function* handleConnectWalletSuccess(_action: ConnectWalletSuccessAction) {
  const location: ReturnType<typeof getLocation> = yield select(getLocation)
  const { pathname, search } = location
  if (pathname === locations.signIn()) {
    const redirectTo = new URLSearchParams(search).get('redirectTo')
    if (redirectTo) {
      yield put(push(decodeURIComponent(redirectTo)))
    } else {
      yield put(push(locations.root()))
    }
  }
}
