import { takeLatest, put, call } from 'redux-saga/effects'

import { LOAD_PROFILE_REQUEST, LoadProfileRequestAction, loadProfileSuccess, loadProfileFailure } from 'modules/profile/actions'
import { profile } from 'lib/api/profile'
import { Profile } from 'modules/profile/types'

export function* profileSaga() {
  yield takeLatest(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
}

function* handleLoadProfileRequest(action: LoadProfileRequestAction) {
  const { id } = action.payload
  try {
    const p: Profile = yield call(() => profile.fetchProfileById(id))
    yield put(loadProfileSuccess(p))
  } catch (e) {
    console.log(e)
    yield put(loadProfileFailure(e.message))
  }
}
