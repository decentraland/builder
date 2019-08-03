import { fork, call, all, takeLatest, put, select } from 'redux-saga/effects'

import { api } from 'lib/api'
import { AUTH_REQUEST, LOGIN, LOGOUT, authRequest, authSuccess, authFailure } from './actions'
import { login, logout, handleCallback, restoreSession } from './utils'
import { isExpired } from './selectors'
import { AuthData } from './types'

export function* authSaga() {
  yield fork(handleRestoreSession)
  yield all([takeLatest(LOGIN, handleLogin), takeLatest(LOGOUT, handleLogout), takeLatest(AUTH_REQUEST, handleAuthRequest)])
}

export function* handleLogin() {
  yield call(login)
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
  let result: AuthData

  try {
    result = yield call(handleCallback)
  } catch (error) {
    try {
      result = yield call(restoreSession)
    } catch (error) {
      yield put(authFailure(error.message))
      return
    }
  }
  try {
    result.user = yield call(() => api.fetchUser())
  } catch (e) {
    // user doesn't have a profile created via avatars.decentraland.{env}
  }

  yield put(authSuccess(result))
}
