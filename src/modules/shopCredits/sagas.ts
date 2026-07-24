import { call, put, takeEvery } from 'redux-saga/effects'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { CreditsAPI, ShopCreditsBalance } from 'lib/api/credits'
import {
  FETCH_SHOP_CREDITS_BALANCE_REQUEST,
  FetchShopCreditsBalanceRequestAction,
  fetchShopCreditsBalanceSuccess,
  fetchShopCreditsBalanceFailure
} from './actions'

export function* shopCreditsSaga(creditsAPI: CreditsAPI) {
  yield takeEvery(FETCH_SHOP_CREDITS_BALANCE_REQUEST, handleFetchShopCreditsBalanceRequest)

  function* handleFetchShopCreditsBalanceRequest(action: FetchShopCreditsBalanceRequestAction) {
    const { address } = action.payload

    try {
      const balance: ShopCreditsBalance = yield call([creditsAPI, creditsAPI.fetchShopCreditsBalance], address)
      yield put(fetchShopCreditsBalanceSuccess(address, balance))
    } catch (e) {
      yield put(fetchShopCreditsBalanceFailure(address, isErrorWithMessage(e) ? e.message : 'Unknown error'))
    }
  }
}
