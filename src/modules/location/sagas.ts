import { all, takeLatest, put, select } from 'redux-saga/effects'
import { getLocation, replace } from 'connected-react-router'
import { LEGACY_AUTH_SUCCESS, AuthSuccessLegacyAction, LEGACY_AUTH_FAILURE, AuthFailureLegacyAction } from 'modules/auth/actions'
import { openModal } from 'modules/modal/actions'
import { locations } from 'routing/locations'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'

export function* locationSaga() {
  yield all([
    takeLatest(LEGACY_AUTH_SUCCESS, handleAuthSuccess),
    takeLatest(LEGACY_AUTH_FAILURE, handleAuthFailure),
    takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  ])
}

function* handleAuthSuccess(action: AuthSuccessLegacyAction) {
  const { options } = action.payload
  if (options.returnUrl) {
    yield put(replace(options.returnUrl))
  } else {
    const location: ReturnType<typeof getLocation> = yield select(getLocation)
    if (location.pathname === locations.callback()) {
      yield put(replace(locations.migrate()))
    }
  }
  if (options.openModal) {
    yield put(openModal(options.openModal.name as any, options.openModal.metadata))
  }
}

function* handleAuthFailure(_action: AuthFailureLegacyAction) {
  const location: ReturnType<typeof getLocation> = yield select(getLocation)
  if (location.pathname === locations.callback()) {
    yield put(replace(locations.migrate()))
  }
}

function* handleLoginSuccess(_action: LoginSuccessAction) {
  const location: ReturnType<typeof getLocation> = yield select(getLocation)
  if (location.pathname === locations.signIn()) {
    yield put(replace(locations.root()))
  }
}
