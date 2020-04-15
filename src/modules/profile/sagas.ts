import { takeLatest, put, call } from 'redux-saga/effects'
import {
  LOAD_PROFILE_REQUEST,
  LoadProfileRequestAction,
  loadProfileSuccess,
  loadProfileFailure,
  loadProfileRequest
} from 'modules/profile/actions'
import { Profile } from 'modules/profile/types'
import { content } from 'lib/api/content'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'

export function* profileSaga() {
  yield takeLatest(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
}

function* handleLoadProfileRequest(action: LoadProfileRequestAction) {
  const { address } = action.payload
  try {
    const profile: Profile[] = yield call(() => content.fetchProfiles(address))
    // TODO: we just handle the first profile
    yield put(loadProfileSuccess(address, profile[0]))
  } catch (error) {
    yield put(loadProfileFailure(address, error.message))
  }
}

function* handleLoginSuccess(action: LoginSuccessAction) {
  yield put(loadProfileRequest(action.payload.wallet.address))
}
