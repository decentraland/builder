import { select, put, race, take } from 'redux-saga/effects'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { AuthIdentity } from 'dcl-crypto'
import { getData } from 'modules/identity/selectors'
import {
  generateIdentityRequest,
  GenerateIdentitySuccessAction,
  GenerateIdentityFailureAction,
  GENERATE_IDENTITY_FAILURE,
  GENERATE_IDENTITY_SUCCESS
} from './actions'

export const ONE_MONTH_IN_MINUTES = 31 * 24 * 60

export function* getIdentity() {
  const address = yield select(getAddress)

  const identities: ReturnType<typeof getData> = yield select(getData)
  let identity: AuthIdentity | null = identities[address] || null

  if (!identity || Date.now() > +new Date(identity.expiration)) {
    yield put(generateIdentityRequest(address))
    const result: { success?: GenerateIdentitySuccessAction; failure?: GenerateIdentityFailureAction } = yield race({
      success: take(GENERATE_IDENTITY_SUCCESS),
      failure: take(GENERATE_IDENTITY_FAILURE)
    })

    if (result.success) {
      identity = result.success.payload.identity
    }
  }

  return identity
}
