import { replace } from 'connected-react-router'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { fork, call, all, takeLatest, put, select } from 'redux-saga/effects'
import {
  LEGACY_AUTH_REQUEST,
  LEGACY_LOGIN,
  LEGACY_LOGOUT,
  authRequestLegacy,
  authSuccessLegacy,
  authFailureLegacy,
  LEGACY_LoginAction,
  MIGRATION_REQUEST,
  migrationSuccess,
  migrationFailure,
  MigrationSuccessAction,
  MIGRATION_SUCCESS
} from './actions'
import { loginLegacy, logoutLegacy, handleCallback, restoreSession, CallbackResult } from './utils'
import { isExpired } from './selectors'
import { AuthData, LoginOptions } from './types'
import { locations } from 'routing/locations'
import { builder } from 'lib/api/builder'
import { loadProjectsRequest } from 'modules/project/actions'
import { loadDeploymentsRequest } from 'modules/deployment/actions'

export function* authSaga() {
  yield fork(handleRestoreSession)
  yield all([
    takeLatest(LEGACY_LOGIN, handleLogin),
    takeLatest(LEGACY_LOGOUT, handleLogout),
    takeLatest(LEGACY_AUTH_REQUEST, handleAuthRequest),
    takeLatest(MIGRATION_REQUEST, handleMigrationRequest),
    takeLatest(MIGRATION_SUCCESS, handleMigrationsSuccess)
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

function* handleMigrationRequest() {
  try {
    const result = yield call(() => builder.migrate())
    yield put(migrationSuccess(result))
  } catch (error) {
    yield put(migrationFailure(error.message))
  }
}

function* handleMigrationsSuccess(action: MigrationSuccessAction) {
  yield put(loadProjectsRequest())
  yield put(loadDeploymentsRequest())
  yield put(replace(locations.root()))
  yield put(openModal('MigrationModal', action.payload.result))
}
