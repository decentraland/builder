import { call, put, takeEvery, select } from 'redux-saga/effects'
import { FETCH_NAMES_REQUEST, FetchNamesRequestAction, fetchNamesFailure, fetchNamesSuccess } from './actions'
import { Name } from './types'
import { manager } from 'lib/api/manager'
import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export function* landSaga() {
  yield takeEvery(FETCH_NAMES_REQUEST, handleFetchLandRequest)
}

function* handleFetchLandRequest(_action: FetchNamesRequestAction) {
  const [eth, from] = yield getEth()
  console.log(eth, from)
  const address = from.toString()
  try {
    const names: Name[] = yield call(() => manager.fetchNames(address))
    yield put(fetchNamesSuccess(address, names))
  } catch (error) {
    yield put(fetchNamesFailure(address, error.message))
  }
}

function* getEth() {
  const eth = Eth.fromCurrentProvider()
  if (!eth) {
    throw new Error('Wallet not found')
  }

  const fromAddress = yield select(getAddress)
  if (!fromAddress) {
    throw new Error(`Invalid from address: ${fromAddress}`)
  }

  const from = Address.fromString(fromAddress)

  return [eth, from]
}
