import { takeLatest, put, select, call, delay, getContext } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { History } from 'history'
import { Authenticator, AuthIdentity } from '@dcl/crypto'
import { ProviderType } from '@dcl/schemas'
import { localStorageClearIdentity, localStorageGetIdentity, localStorageStoreIdentity } from '@dcl/single-sign-on-client'
import { getData as getWallet, isConnected, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { config } from 'config'
import {
  CONNECT_WALLET_SUCCESS,
  CONNECT_WALLET_FAILURE,
  ConnectWalletSuccessAction,
  enableWalletRequest,
  ENABLE_WALLET_SUCCESS,
  ENABLE_WALLET_FAILURE,
  EnableWalletSuccessAction,
  EnableWalletFailureAction,
  disconnectWalletRequest,
  CHANGE_ACCOUNT,
  ChangeAccountAction
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { locations, redirectToAuthDapp } from 'routing/locations'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { getEth } from 'modules/wallet/utils'
import { clearAssetPacks } from 'modules/assetPack/actions'
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
  GenerateIdentitySuccessAction,
  GenerateIdentityFailureAction,
  GENERATE_IDENTITY_FAILURE,
  loginRequest,
  loginSuccess,
  loginFailure
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
  const address = action.payload.address.toLowerCase()
  try {
    const wallet: Wallet | null = yield select(getWallet)

    if (wallet?.providerType === ProviderType.WALLET_CONNECT) {
      // Without the delay, the wallet is never asked to sign the message.
      // https://github.com/decentraland/builder/issues/2521
      yield delay(1000)
    }

    const eth: ethers.providers.Web3Provider = yield call(getEth)

    const account = ethers.Wallet.createRandom()

    const payload = {
      address: account.address.toString(),
      publicKey: ethers.utils.hexlify(account.publicKey),
      privateKey: ethers.utils.hexlify(account.privateKey)
    }

    const expiration = Number(config.get('IDENTITY_EXPIRATION_MINUTES', ONE_MONTH_IN_MINUTES.toString()))

    const signer = eth.getSigner()

    const identity: AuthIdentity = yield Authenticator.initializeAuthChain(address, payload, expiration, message =>
      signer.signMessage(message)
    )

    yield call(localStorageStoreIdentity, address, identity)

    yield put(generateIdentitySuccess(address, identity))
  } catch (error) {
    yield put(generateIdentityFailure(address, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleLogin(action: LoginRequestAction) {
  const { restoreSession, providerType } = action.payload
  // Check if we need to generate an identity
  const shouldLogin: boolean = yield select(state => !isLoggedIn(state))
  if (shouldLogin && !restoreSession) {
    // Check if we need to connect the wallet
    const shouldConnectWallet: boolean = yield select(state => !isConnected(state))
    if (shouldConnectWallet) {
      if (!providerType) {
        yield put(loginFailure('Undefined provider type'))
        return
      }

      // enable wallet
      yield put(enableWalletRequest(providerType))
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

    const address: string = yield select(getAddress)
    const identity: AuthIdentity | null = yield call(localStorageGetIdentity, address)

    if (identity) {
      yield put(generateIdentitySuccess(address, identity))
    } else {
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
    yield put(closeModal('WalletLoginModal'))
  } else {
    yield put(loginFailure(restoreSession ? 'Failed to restore session' : 'Failed to login'))
  }
}

function* handleLogout(_action: LogoutAction) {
  const address: string | undefined = yield select(getAddress)
  if (address) {
    yield put(disconnectWalletRequest())
    yield put(destroyIdentity(address))
    yield call(localStorageClearIdentity, address)
  }
}

function* handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
  const { wallet } = action.payload
  const { address, providerType } = wallet

  const identity = localStorageGetIdentity(address)

  if (identity) {
    yield put(generateIdentitySuccess(address, identity))
    yield put(loginRequest(providerType, true))
  } else {
    redirectToAuthDapp()
  }
}

function* handleChangeAccount(action: ChangeAccountAction) {
  const { wallet } = action.payload
  const { address, providerType } = wallet
  const history: History = yield getContext('history')

  const identity = localStorageGetIdentity(address)

  if (identity) {
    yield put(generateIdentitySuccess(address, identity))
    yield put(loginRequest(providerType, true))
  } else {
    redirectToAuthDapp()
  }

  yield put(clearAssetPacks())

  const location = history.location

  const isEditor = location.pathname.includes('editor')

  if (isEditor) {
    history.replace(locations.root())
  }
}
