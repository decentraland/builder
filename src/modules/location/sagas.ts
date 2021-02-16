import { all, takeLatest, put, select } from 'redux-saga/effects'
import { getLocation, replace } from 'connected-react-router'
import { locations } from 'routing/locations'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'

export function* locationSaga() {
  yield all([takeLatest(LOGIN_SUCCESS, handleLoginSuccess)])
}

function* handleLoginSuccess(_action: LoginSuccessAction) {
  const location: ReturnType<typeof getLocation> = yield select(getLocation)
  if (location.pathname === locations.signIn()) {
    yield put(replace(locations.root()))
  }
}
