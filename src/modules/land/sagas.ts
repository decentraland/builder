import { Eth } from 'web3x-es/eth'
import { takeLatest, call, put, takeEvery, select } from 'redux-saga/effects'
import {
  FETCH_LANDS_REQUEST,
  FetchLandsRequestAction,
  fetchLandsFailure,
  fetchLandsSuccess,
  fetchLandsRequest,
  TRANSFER_LAND_REQUEST,
  TransferLandRequestAction,
  transferLandFailure,
  transferLandSuccess,
  EDIT_LAND_REQUEST,
  EditLandRequestAction,
  editLandSuccess,
  editLandFailure,
  SET_OPERATOR_REQUEST,
  SetOperatorRequestAction,
  setOperatorSuccess,
  setOperatorFailure
} from './actions'
import { Land, LandType } from './types'
import { manager } from 'lib/api/manager'
import { LANDRegistry } from 'contracts/LANDRegistry'
import {
  CONNECT_WALLET_SUCCESS,
  CHANGE_ACCOUNT,
  ConnectWalletSuccessAction,
  ChangeAccountAction
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Address } from 'web3x-es/address'
import { LAND_REGISTRY_ADDRESS, ESTATE_REGISTRY_ADDRESS } from 'modules/common/contracts'
import { EstateRegistry } from 'contracts/EstateRegistry'

export function* landSaga() {
  yield takeEvery(SET_OPERATOR_REQUEST, handleSetOperatorRequest)
  yield takeEvery(EDIT_LAND_REQUEST, handleEditLandRequest)
  yield takeEvery(TRANSFER_LAND_REQUEST, handleTransferLandRequest)
  yield takeEvery(FETCH_LANDS_REQUEST, handleFetchLandRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleWallet)
  yield takeLatest(CHANGE_ACCOUNT, handleWallet)
}

function* handleSetOperatorRequest(action: SetOperatorRequestAction) {
  const { land, address } = action.payload

  const fromAddress = yield select(getAddress)

  try {
    const eth = Eth.fromCurrentProvider()

    if (!eth) {
      throw new Error('Wallet not found')
    }

    if (!fromAddress) {
      throw new Error(`Invalid address: ${fromAddress}`)
    }

    const from = Address.fromString(fromAddress)
    const operator = address ? Address.fromString(address) : Address.ZERO

    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))
        const tokenId = yield call(() => landRegistry.methods.encodeTokenId(land.x!, land.y!).call())
        const txHash = yield call(() =>
          landRegistry.methods
            .setUpdateOperator(tokenId, operator)
            .send({ from })
            .getTxHash()
        )
        yield put(setOperatorSuccess(land, address, txHash))
        break
      }
      case LandType.ESTATE: {
        const estateRegistry = new EstateRegistry(eth, Address.fromString(ESTATE_REGISTRY_ADDRESS))
        const txHash = yield call(() =>
          estateRegistry.methods
            .setUpdateOperator(land.id, operator)
            .send({ from })
            .getTxHash()
        )
        yield put(setOperatorSuccess(land, address, txHash))
        break
      }
      default:
        throw new Error(`Unknown Land Type: ${land.type}`)
    }
  } catch (error) {
    yield put(setOperatorFailure(land, address, error.message))
  }
}

function* handleEditLandRequest(action: EditLandRequestAction) {
  const { land, name, description } = action.payload

  const fromAddress = yield select(getAddress)

  const data = `0,${name},${description},`

  try {
    const eth = Eth.fromCurrentProvider()

    if (!eth) {
      throw new Error('Wallet not found')
    }

    if (!fromAddress) {
      throw new Error(`Invalid address: ${fromAddress}`)
    }

    const from = Address.fromString(fromAddress)

    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))
        const txHash = yield call(() =>
          landRegistry.methods
            .updateLandData(land.x!, land.y!, data)
            .send({ from })
            .getTxHash()
        )
        yield put(editLandSuccess(land, name, description, txHash))
        break
      }
      case LandType.ESTATE: {
        const estateRegistry = new EstateRegistry(eth, Address.fromString(ESTATE_REGISTRY_ADDRESS))
        const txHash = yield call(() =>
          estateRegistry.methods
            .updateMetadata(land.id, data)
            .send({ from })
            .getTxHash()
        )
        yield put(editLandSuccess(land, name, description, txHash))
        break
      }
      default:
        throw new Error(`Unknown Land Type: ${land.type}`)
    }
  } catch (error) {
    yield put(editLandFailure(land, name, description, error.message))
  }
}

function* handleTransferLandRequest(action: TransferLandRequestAction) {
  const { land, address } = action.payload

  const fromAddress = yield select(getAddress)

  try {
    const eth = Eth.fromCurrentProvider()

    if (!eth) {
      throw new Error('Wallet not found')
    }

    if (!fromAddress) {
      throw new Error(`Invalid from address: ${fromAddress}`)
    }

    const from = Address.fromString(fromAddress)
    const to = Address.fromString(address)

    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))
        const id = yield call(() => landRegistry.methods.encodeTokenId(land.x!, land.y!).call())
        const txHash = yield call(() =>
          landRegistry.methods
            .transferFrom(from, to, id)
            .send({ from })
            .getTxHash()
        )
        yield put(transferLandSuccess(land, address, txHash))
        break
      }
      case LandType.ESTATE: {
        const estateRegistry = new EstateRegistry(eth, Address.fromString(ESTATE_REGISTRY_ADDRESS))
        const txHash = yield call(() =>
          estateRegistry.methods
            .transferFrom(from, to, land.id)
            .send({ from })
            .getTxHash()
        )
        yield put(transferLandSuccess(land, address, txHash))
        break
      }
      default:
        throw new Error(`Unknown Land Type: ${land.type}`)
    }
  } catch (error) {
    yield put(transferLandFailure(land, address, error.message))
  }
}

function* handleFetchLandRequest(action: FetchLandsRequestAction) {
  const { address } = action.payload
  try {
    const land: Land[] = yield call(() => manager.fetchLand(address))
    yield put(fetchLandsSuccess(address, land))
  } catch (error) {
    yield put(fetchLandsFailure(address, error.message))
  }
}

function* handleWallet(action: ConnectWalletSuccessAction | ChangeAccountAction) {
  const { address } = action.payload.wallet
  yield put(fetchLandsRequest(address))
}
