import { takeLatest, put, call, takeEvery } from 'redux-saga/effects'
import {
  LOAD_PROFILE_REQUEST,
  LoadProfileRequestAction,
  loadProfileSuccess,
  loadProfileFailure,
  loadProfileRequest
} from 'modules/profile/actions'
import { Profile } from 'modules/profile/types'
import { content } from 'lib/api/peer'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'

export function* profileSaga() {
  yield takeEvery(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
}

function* handleLoadProfileRequest(action: LoadProfileRequestAction) {
  const { address } = action.payload
  try {
    const profile: Profile = yield call(() => content.fetchProfile(address))
    yield put(loadProfileSuccess(address, profile))
  } catch (error) {
    yield put(loadProfileFailure(address, error.message))
  }
}

function* handleLoginSuccess(action: LoginSuccessAction) {
  yield put(loadProfileRequest(action.payload.wallet.address))
}
