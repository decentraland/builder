import { all, takeLatest, put, select } from 'redux-saga/effects'
import { getLocation, replace } from 'connected-react-router'
import { locations } from 'routing/locations'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'
import { CLAIM_NAME_SUCCESS, SetENSContentSuccessAction, SET_ENS_CONTENT_SUCCESS } from 'modules/ens/actions'

export function* locationSaga() {
  yield all([
    takeLatest(LOGIN_SUCCESS, handleLoginSuccess),
    takeLatest(SET_ENS_CONTENT_SUCCESS, handleSetENSContentSuccess),
    takeLatest(CLAIM_NAME_SUCCESS, goToActivity)
  ])
}

function* handleLoginSuccess(_action: LoginSuccessAction) {
  const location: ReturnType<typeof getLocation> = yield select(getLocation)
  if (location.pathname === locations.signIn()) {
    yield put(replace(locations.root()))
  }
}

function* handleSetENSContentSuccess(action: SetENSContentSuccessAction) {
  const { land } = action.payload
  if (!land) {
    yield goToActivity()
  }
}

function* goToActivity() {
  yield put(replace(locations.activity()))
}
