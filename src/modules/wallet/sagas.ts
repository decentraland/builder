import { all, takeEvery, put, call, take } from 'redux-saga/effects'
import { ChainId, Network } from '@dcl/schemas'
import { ContractName } from 'decentraland-transactions'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
import {
  CHANGE_ACCOUNT,
  CHANGE_NETWORK,
  CONNECT_WALLET_SUCCESS,
  ChangeAccountAction,
  ChangeNetworkAction,
  ConnectWalletSuccessAction,
  switchNetworkRequest,
  SWITCH_NETWORK_SUCCESS
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { fetchAuthorizationsRequest } from 'decentraland-dapps/dist/modules/authorization/actions'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { config } from 'config'
import { buildManaAuthorization } from 'lib/mana'
import { getWallet, TRANSACTIONS_API_URL } from './utils'

const baseWalletSaga = createWalletSaga({
  CHAIN_ID: config.get('CHAIN_ID') || ChainId.ETHEREUM_MAINNET,
  POLL_INTERVAL: 0,
  TRANSACTIONS_API_URL
})

export function* walletSaga() {
  yield all([baseWalletSaga(), customWalletSaga()])
}

function* customWalletSaga() {
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleWalletChange)
  yield takeEvery(CHANGE_ACCOUNT, handleWalletChange)
  yield takeEvery(CHANGE_NETWORK, handleWalletChange)
}

export function* changeToEthereumNetwork() {
  const ethereumChainId: number = yield call(getChainIdByNetwork, Network.ETHEREUM)
  const wallet: Wallet = yield call(getWallet)
  if (wallet.chainId !== ethereumChainId) {
    yield put(switchNetworkRequest(ethereumChainId, wallet.chainId))
    yield take(SWITCH_NETWORK_SUCCESS)
  }
}

function* handleWalletChange(action: ConnectWalletSuccessAction | ChangeAccountAction | ChangeNetworkAction) {
  const { wallet } = action.payload
  const chainId = wallet.networks.MATIC.chainId
  // All authorizations to be fetched must be added to the following list
  const authorizations: Authorization[] = []

  try {
    authorizations.push(buildManaAuthorization(wallet.address, chainId, ContractName.CollectionManager))

    yield put(fetchAuthorizationsRequest(authorizations))
  } catch (error) {
    console.error(error)
  }
}
