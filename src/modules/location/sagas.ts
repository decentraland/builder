import { all, takeLatest, put, select } from 'redux-saga/effects'
import { AUTH_SUCCESS, AuthSuccessAction, AUTH_FAILURE } from 'modules/auth/actions'
import { locations } from 'routing/locations'
import { getLocation, replace } from 'connected-react-router'

export function* locationSaga() {
  yield all([takeLatest(AUTH_SUCCESS, handleCallback), takeLatest(AUTH_FAILURE, handleCallback)])
}

function* handleCallback(action: AuthSuccessAction) {
  if (action.payload.redirectUrl) {
    yield put(replace(action.payload.redirectUrl))
  } else {
    const location: ReturnType<typeof getLocation> = yield select(getLocation)
    if (location.pathname === locations.callback()) {
      yield put(replace(locations.root()))
    }
  }
}
