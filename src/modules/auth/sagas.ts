import { fork, call, all, takeLatest, put, select } from 'redux-saga/effects'
import {
  LEGACY_AUTH_REQUEST,
  LEGACY_LOGIN,
  LEGACY_LOGOUT,
  authRequestLegacy,
  authSuccessLegacy,
  authFailureLegacy,
  LEGACY_LoginAction
} from './actions'
import { loginLegacy, logoutLegacy, handleCallback, restoreSession, CallbackResult } from './utils'
import { isExpired } from './selectors'
import { AuthData, LoginOptions } from './types'

export function* authSaga() {
  yield fork(handleRestoreSession)
  yield all([
    takeLatest(LEGACY_LOGIN, handleLogin),
    takeLatest(LEGACY_LOGOUT, handleLogout),
    takeLatest(LEGACY_AUTH_REQUEST, handleAuthRequest)
  ])
}

export function* handleLogin(action: LEGACY_LoginAction) {
  yield call(loginLegacy, action.payload)
}

function* handleLogout() {
  yield call(logoutLegacy)
}

export function* handleRestoreSession() {
  yield put(authRequestLegacy())
}

export function* checkExpiredSession() {
  const hasExpired = yield select(isExpired)
  if (hasExpired) {
    yield put(authRequestLegacy())
  }
}

export function* handleAuthRequest() {
  let data: AuthData
  let options: LoginOptions = {}
  try {
    const result: CallbackResult = yield call(handleCallback)
    data = result.data
    options = result.options
  } catch (error) {
    try {
      data = yield call(restoreSession)
    } catch (error) {
      yield put(authFailureLegacy(error.message))
      return
    }
  }

  yield put(authSuccessLegacy(data, options))
}
