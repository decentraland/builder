import { takeLatest, takeEvery, call, put } from 'redux-saga/effects'
import { BuilderAPI } from 'lib/api/builder'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import {
  FETCH_THIRD_PARTIES_REQUEST,
  fetchThirdPartiesRequest,
  fetchThirdPartiesSuccess,
  fetchThirdPartiesFailure,
  FetchThirdPartiesRequestAction
} from './actions'
import { ThirdParty } from './types'

export function* thirdPartySaga(builder: BuilderAPI) {
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeEvery(FETCH_THIRD_PARTIES_REQUEST, handleFetchThirdPartiesRequest)

  function* handleLoginSuccess(action: LoginSuccessAction) {
    const { wallet } = action.payload
    yield put(fetchThirdPartiesRequest(wallet.address))
  }

  function* handleFetchThirdPartiesRequest(action: FetchThirdPartiesRequestAction) {
    const { address } = action.payload
    try {
      const thirdParties: ThirdParty[] = yield call(builder.fetchThirdParties, address)
      yield put(fetchThirdPartiesSuccess(thirdParties))
    } catch (error) {
      yield put(fetchThirdPartiesFailure(error.message))
    }
  }
}
