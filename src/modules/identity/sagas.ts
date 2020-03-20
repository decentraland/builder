import { takeLatest, put } from 'redux-saga/effects'
import { Personal } from 'web3x-es/personal'
import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { bufferToHex } from 'web3x-es/utils'
import { Account } from 'web3x-es/account'
import { env } from 'decentraland-commons'
import { Authenticator } from 'dcl-crypto'
import { GENERATE_IDENTITY_REQUEST, GenerateIdentityRequestAction, generateIdentityFailure, generateIdentitySuccess } from './actions'
import { ONE_MONTH_IN_MINUTES } from './utils'

export function* identitySaga() {
  yield takeLatest(GENERATE_IDENTITY_REQUEST, handleGenerateIdentityRequest)
}

function* handleGenerateIdentityRequest(action: GenerateIdentityRequestAction) {
  const { address } = action.payload

  try {
    const eth = Eth.fromCurrentProvider()

    if (!eth) {
      throw new Error('Wallet not found')
    }

    const account = Account.create()

    const payload = {
      address: account.address.toString(),
      publicKey: bufferToHex(account.publicKey),
      privateKey: bufferToHex(account.privateKey)
    }

    const expiration = Number(env.get('REACT_APP_IDENTITY_EXPIRATION_MINUTES', ONE_MONTH_IN_MINUTES))

    const personal = new Personal(eth.provider)

    const identity = yield Authenticator.initializeAuthChain(address, payload, expiration, message =>
      personal.sign(message, Address.fromString(address), '')
    )

    yield put(generateIdentitySuccess(address, identity))
  } catch (error) {
    yield put(generateIdentityFailure(address, error))
  }
}
