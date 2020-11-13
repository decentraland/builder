import { takeLatest, put, select, call } from 'redux-saga/effects'
import { Eth } from 'web3x-es/eth'
import { Personal } from 'web3x-es/personal'
import { Address } from 'web3x-es/address'
import { bufferToHex } from 'web3x-es/utils'
import { Account } from 'web3x-es/account'
import { replace, getLocation } from 'connected-react-router'
import { Authenticator } from 'dcl-crypto'
import { env } from 'decentraland-commons'
import { getData as getWallet, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { createEth } from 'decentraland-dapps/dist/lib/eth'
import {
  enableWalletRequest,
  CONNECT_WALLET_SUCCESS,
  CONNECT_WALLET_FAILURE,
  ENABLE_WALLET_SUCCESS,
  ENABLE_WALLET_FAILURE,
  EnableWalletSuccessAction,
  EnableWalletFailureAction,
  disconnectWallet,
  CHANGE_ACCOUNT
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { clearAssetPacks } from 'modules/assetPack/actions'
import { locations } from 'routing/locations'
import {
  GENERATE_IDENTITY_REQUEST,
  GenerateIdentityRequestAction,
  generateIdentityFailure,
  generateIdentitySuccess,
  LoginRequestAction,
  generateIdentityRequest,
  GENERATE_IDENTITY_SUCCESS,
  LOGIN_REQUEST,
  LOGOUT,
  LogoutAction,
  destroyIdentity,
  loginFailure,
  GenerateIdentitySuccessAction,
  GenerateIdentityFailureAction,
  GENERATE_IDENTITY_FAILURE,
  loginRequest,
  loginSuccess
} from './actions'
import { ONE_MONTH_IN_MINUTES, takeRace } from './utils'
import { isLoggedIn, getCurrentIdentity } from './selectors'
import { Race } from './types'

export function* identitySaga() {
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeLatest(CHANGE_ACCOUNT, handleChangeAccount)
  yield takeLatest(GENERATE_IDENTITY_REQUEST, handleGenerateIdentityRequest)
  yield takeLatest(LOGIN_REQUEST, handleLogin)
  yield takeLatest(LOGOUT, handleLogout)
}

function* handleGenerateIdentityRequest(action: GenerateIdentityRequestAction) {
  const { address } = action.payload

  try {
    const eth: Eth | null = yield call(createEth)
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

function* handleLogin(action: LoginRequestAction) {
  const { restoreSession } = action.payload
  // Check if we need to generate an identity
  const shouldLogin = yield select(state => !isLoggedIn(state))
  if (shouldLogin && !restoreSession) {
    // Check if we need to connect the wallet
    const shouldConnectWallet = yield select(state => !isConnected(state))
    if (shouldConnectWallet) {
      // enable wallet
      yield put(enableWalletRequest())
      const enableWallet: Race<EnableWalletSuccessAction, EnableWalletFailureAction> = yield takeRace(
        ENABLE_WALLET_SUCCESS,
        ENABLE_WALLET_FAILURE
      )

      if (!enableWallet.success) {
        yield put(loginFailure(enableWallet.failure.payload.error))
        return
      }

      // connect wallet (a CONNECT_WALLET_REQUEST is dispatched automatically after ENABLE_WALLET_SUCCESS, so we just wait for it to resolve)
      const connectWallet: Race<EnableWalletSuccessAction, EnableWalletFailureAction> = yield takeRace(
        CONNECT_WALLET_SUCCESS,
        CONNECT_WALLET_FAILURE
      )

      if (!connectWallet.success) {
        yield put(loginFailure(connectWallet.failure.payload.error))
        return
      }
    }

    // Check if we need  to generate a new identity
    const identity = yield select(getCurrentIdentity)
    if (!identity) {
      // Generate a new identity
      const address = yield select(getAddress)
      yield put(generateIdentityRequest(address))
      const generateIdentity: Race<GenerateIdentitySuccessAction, GenerateIdentityFailureAction> = yield takeRace(
        GENERATE_IDENTITY_SUCCESS,
        GENERATE_IDENTITY_FAILURE
      )

      if (!generateIdentity.success) {
        yield put(loginFailure(generateIdentity.failure.payload.error))
        return
      }
    }
  }

  const wallet: ReturnType<typeof getWallet> = yield select(getWallet)
  const identity: ReturnType<typeof getCurrentIdentity> = yield select(getCurrentIdentity)

  if (wallet && identity) {
    yield put(loginSuccess(wallet, identity))
  } else {
    yield put(loginFailure(restoreSession ? 'Failed to restore session' : 'Failed to login'))
  }
}

function* handleLogout(_action: LogoutAction) {
  const address = yield select(getAddress)
  if (address) {
    yield put(disconnectWallet())
    yield put(destroyIdentity(address))
  }
}

function* handleConnectWalletSuccess() {
  const shouldRestoreSession = yield select(isLoggedIn)
  if (shouldRestoreSession) {
    yield put(loginRequest(true))
  }
}

function* handleChangeAccount() {
  const shouldRestoreSession = yield select(isLoggedIn)
  if (shouldRestoreSession) {
    yield put(loginRequest(true))
  }
  yield put(clearAssetPacks())

  const location: ReturnType<typeof getLocation> = yield select(getLocation)
  const isEditor = location.pathname.includes('editor')
  if (isEditor) {
    yield put(replace(locations.root()))
  }
}
