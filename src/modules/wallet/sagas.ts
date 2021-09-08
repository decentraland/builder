import { all, takeEvery, put } from 'redux-saga/effects'
import { ChainId } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { env } from 'decentraland-commons'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
import {
  CHANGE_ACCOUNT,
  CHANGE_NETWORK,
  CONNECT_WALLET_SUCCESS,
  ChangeAccountAction,
  ChangeNetworkAction,
  ConnectWalletSuccessAction
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { fetchAuthorizationsRequest } from 'decentraland-dapps/dist/modules/authorization/actions'
import { Authorization, AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { TRANSACTIONS_API_URL } from 'modules/wallet/utils'

const baseWalletSaga = createWalletSaga({
  CHAIN_ID: env.get('REACT_APP_CHAIN_ID') || ChainId.ETHEREUM_MAINNET,
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

function* handleWalletChange(action: ConnectWalletSuccessAction | ChangeAccountAction | ChangeNetworkAction) {
  const { wallet } = action.payload
  const chainId = wallet.networks.MATIC.chainId
  const authorizations: Authorization[] = []

  try {
    if (env.get('REACT_APP_FF_WEARABLES')) {
      authorizations.push({
        type: AuthorizationType.ALLOWANCE,
        address: wallet.address,
        contractAddress: getContract(ContractName.MANAToken, chainId).address,
        contractName: ContractName.MANAToken,
        authorizedAddress: getContract(ContractName.CollectionManager, chainId).address,
        chainId
      })
    }

    yield put(fetchAuthorizationsRequest(authorizations))
  } catch (error) {}
}
