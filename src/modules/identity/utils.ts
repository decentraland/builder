import { select, put, race, take, delay } from 'redux-saga/effects'
import { AuthIdentity } from 'dcl-crypto'
import { getCurrentIdentity, isLoggedIn } from 'modules/identity/selectors'
import { loginRequest, LOGIN_SUCCESS, LOGIN_FAILURE } from './actions'

export const ONE_MONTH_IN_MINUTES = 31 * 24 * 60

export function isValid(identity?: AuthIdentity | null) {
  return !!identity && Date.now() < +new Date(identity.expiration)
}

// Helper that always yields a valid identity
export function* getIdentity(): IterableIterator<any> {
  const shouldLogin = yield select(state => !isLoggedIn(state))
  if (shouldLogin) {
    yield put(loginRequest())
    const login: any = yield takeRace(LOGIN_SUCCESS, LOGIN_FAILURE)
    if (login.success) {
      // wait a sec and retry
      yield delay(1000)
      return yield getIdentity()
    }
  }
  // Return current identity
  return yield select(getCurrentIdentity)
}

export function takeRace(success: string, failure: string) {
  return race({
    success: take(success),
    failure: take(failure)
  })
}
