import { fork, call, all, takeLatest, put, select } from 'redux-saga/effects'

import { avatars } from 'lib/api/avatars'
import { AUTH_REQUEST, LOGIN, LOGOUT, authRequest, authSuccess, authFailure, LoginAction } from './actions'
import { login, logout, handleCallback, restoreSession, CallbackResult } from './utils'
import { isExpired } from './selectors'
import { AuthData, LoginOptions } from './types'

export function* authSaga() {
  yield fork(handleRestoreSession)
  yield all([takeLatest(LOGIN, handleLogin), takeLatest(LOGOUT, handleLogout), takeLatest(AUTH_REQUEST, handleAuthRequest)])
}

export function* handleLogin(action: LoginAction) {
  yield call(login, action.payload)
}

function* handleLogout() {
  yield call(logout)
}

export function* handleRestoreSession() {
  yield put(authRequest())
}

export function* checkExpiredSession() {
  const hasExpired = yield select(isExpired)
  if (hasExpired) {
    yield put(authRequest())
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
      yield put(authFailure(error.message))
      return
    }
  }
  try {
    data.user = yield call(() => avatars.fetchUser(data.accessToken))
  } catch (e) {
    // user doesn't have a profile created via avatars.decentraland.{env}
  }

  yield put(authSuccess(data, options))
}
