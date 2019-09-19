import { all, takeLatest, put, select } from 'redux-saga/effects'
import { getLocation, replace } from 'connected-react-router'
import { AUTH_SUCCESS, AuthSuccessAction, AUTH_FAILURE, AuthFailureAction } from 'modules/auth/actions'
import { openModal } from 'modules/modal/actions'
import { locations } from 'routing/locations'

export function* locationSaga() {
  yield all([takeLatest(AUTH_SUCCESS, handleAuthSuccess), takeLatest(AUTH_FAILURE, handleAuthFailure)])
}

function* handleAuthSuccess(action: AuthSuccessAction) {
  const { options } = action.payload
  if (options.returnUrl) {
    yield put(replace(options.returnUrl))
  } else {
    const location: ReturnType<typeof getLocation> = yield select(getLocation)
    if (location.pathname === locations.callback()) {
      yield put(replace(locations.root()))
    }
  }
  if (options.openModal) {
    yield put(openModal(options.openModal.name as any, options.openModal.metadata))
  }
}

function* handleAuthFailure(_action: AuthFailureAction) {
  if (location.pathname === locations.callback()) {
    yield put(replace(locations.root()))
  }
}
