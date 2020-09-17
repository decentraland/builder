import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import {
  CONNECT_WALLET_SUCCESS,
  CHANGE_ACCOUNT,
  ConnectWalletSuccessAction,
  ChangeAccountAction
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { takeLatest, call, put, takeEvery, all } from 'redux-saga/effects'
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
  setOperatorFailure,
  CREATE_ESTATE_REQUEST,
  CreateEstateRequestAction,
  createEstateSuccess,
  createEstateFailure,
  EditEstateRequestAction,
  editEstateSuccess,
  editEstateFailure,
  EDIT_ESTATE_REQUEST,
  DISSOLVE_ESTATE_REQUEST,
  DissolveEstateRequestAction,
  dissolveEstateSuccess,
  dissolveEstateFailure,
  SET_UPDATE_MANAGER_REQUEST,
  SetUpdateManagerRequestAction,
  setUpdateManagerSuccess,
  setUpdateManagerFailure
} from './actions'
import { manager } from 'lib/api/manager'
import { LANDRegistry } from 'contracts/LANDRegistry'
import { LAND_REGISTRY_ADDRESS, ESTATE_REGISTRY_ADDRESS } from 'modules/common/contracts'
import { EstateRegistry } from 'contracts/EstateRegistry'
import { push } from 'connected-react-router'
import { locations } from 'routing/locations'
import { closeModal } from 'modules/modal/actions'
import { getCurrentAddress } from 'modules/wallet/utils'
import { splitCoords, buildMetadata } from './utils'
import { Land, LandType, Authorization } from './types'

export function* landSaga() {
  yield takeEvery(SET_UPDATE_MANAGER_REQUEST, handleSetUpdateManagerRequest)
  yield takeEvery(DISSOLVE_ESTATE_REQUEST, handleDissolveEstateRequest)
  yield takeEvery(EDIT_ESTATE_REQUEST, handleEditEstateRequest)
  yield takeEvery(CREATE_ESTATE_REQUEST, handleCreateEstateRequest)
  yield takeEvery(SET_OPERATOR_REQUEST, handleSetOperatorRequest)
  yield takeEvery(EDIT_LAND_REQUEST, handleEditLandRequest)
  yield takeEvery(TRANSFER_LAND_REQUEST, handleTransferLandRequest)
  yield takeEvery(FETCH_LANDS_REQUEST, handleFetchLandRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleWallet)
  yield takeLatest(CHANGE_ACCOUNT, handleWallet)
}

function* handleSetUpdateManagerRequest(action: SetUpdateManagerRequestAction) {
  const { address, isApproved, type } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const manager = Address.fromString(address)
    switch (type) {
      case LandType.PARCEL: {
        const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))
        const txHash = yield call(() =>
          landRegistry.methods
            .setUpdateManager(from, manager, isApproved)
            .send({ from })
            .getTxHash()
        )
        yield put(setUpdateManagerSuccess(address, type, isApproved, txHash))
        break
      }
      case LandType.ESTATE: {
        const estateRegistry = new EstateRegistry(eth, Address.fromString(ESTATE_REGISTRY_ADDRESS))
        const txHash = yield call(() =>
          estateRegistry.methods
            .setUpdateManager(from, manager, isApproved)
            .send({ from })
            .getTxHash()
        )
        yield put(setUpdateManagerSuccess(address, type, isApproved, txHash))
        break
      }
    }
    yield put(push(locations.activity()))
  } catch (error) {
    yield put(setUpdateManagerFailure(address, type, isApproved, error.message))
  }
}

function* handleDissolveEstateRequest(action: DissolveEstateRequestAction) {
  const { land } = action.payload

  try {
    if (land.type !== LandType.ESTATE) {
      throw new Error(`Invalid LandType: "${land.type}"`)
    }
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))
    const estateRegistry = new EstateRegistry(eth, Address.fromString(ESTATE_REGISTRY_ADDRESS))
    const tokenIds = yield all(land.parcels!.map(parcel => landRegistry.methods.encodeTokenId(parcel.x, parcel.y).call()))
    const txHash = yield call(() =>
      estateRegistry.methods
        .transferManyLands(land.id, tokenIds, from)
        .send({ from })
        .getTxHash()
    )
    yield put(dissolveEstateSuccess(land, txHash))
    yield put(closeModal('DissolveModal'))
    yield put(push(locations.activity()))
  } catch (error) {
    yield put(dissolveEstateFailure(land, error.message))
  }
}

function* handleCreateEstateRequest(action: CreateEstateRequestAction) {
  const { name, description, coords } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const [xs, ys] = splitCoords(coords)
    const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))
    const metadata = buildMetadata(name, description)
    const txHash = yield call(() =>
      landRegistry.methods
        .createEstateWithMetadata(xs, ys, from, metadata)
        .send({ from })
        .getTxHash()
    )

    yield put(createEstateSuccess(name, description, coords, txHash))
    yield put(closeModal('EstateEditorModal'))
    yield put(push(locations.activity()))
  } catch (error) {
    yield put(createEstateFailure(name, description, coords, error.message))
  }
}

function* handleEditEstateRequest(action: EditEstateRequestAction) {
  const { land, toAdd, toRemove } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
    const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))

    if (toAdd.length > 0) {
      const [xsToAdd, ysToAdd] = splitCoords(toAdd)
      const txHash = yield call(() =>
        landRegistry.methods
          .transferManyLandToEstate(xsToAdd, ysToAdd, land.id)
          .send({ from })
          .getTxHash()
      )
      yield put(editEstateSuccess(land, toAdd, 'add', txHash))
    }

    if (toRemove.length > 0) {
      const estateRegistry = new EstateRegistry(eth, Address.fromString(ESTATE_REGISTRY_ADDRESS))
      const tokenIds = yield all(toRemove.map(({ x, y }) => landRegistry.methods.encodeTokenId(x, y).call()))
      const txHash = yield call(() =>
        estateRegistry.methods
          .transferManyLands(land.id, tokenIds, from)
          .send({ from })
          .getTxHash()
      )
      yield put(editEstateSuccess(land, toRemove, 'remove', txHash))
    }
    yield put(closeModal('EstateEditorModal'))
    yield put(push(locations.activity()))
  } catch (error) {
    yield put(editEstateFailure(land, toAdd, toRemove, error.message))
  }
}

function* handleSetOperatorRequest(action: SetOperatorRequestAction) {
  const { land, address } = action.payload

  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
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
    yield put(push(locations.activity()))
  } catch (error) {
    yield put(setOperatorFailure(land, address, error.message))
  }
}

function* handleEditLandRequest(action: EditLandRequestAction) {
  const { land, name, description } = action.payload

  const metadata = buildMetadata(name, description)

  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()

    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))
        const txHash = yield call(() =>
          landRegistry.methods
            .updateLandData(land.x!, land.y!, metadata)
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
            .updateMetadata(land.id, metadata)
            .send({ from })
            .getTxHash()
        )
        yield put(editLandSuccess(land, name, description, txHash))
        break
      }
      default:
        throw new Error(`Unknown Land Type: ${land.type}`)
    }
    yield put(push(locations.activity()))
  } catch (error) {
    yield put(editLandFailure(land, name, description, error.message))
  }
}

function* handleTransferLandRequest(action: TransferLandRequestAction) {
  const { land, address } = action.payload

  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()
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
    yield put(push(locations.activity()))
  } catch (error) {
    yield put(transferLandFailure(land, address, error.message))
  }
}

function* handleFetchLandRequest(action: FetchLandsRequestAction) {
  const { address } = action.payload
  try {
    const [land, authorizations]: [Land[], Authorization[]] = yield call(() => manager.fetchLand(address))
    yield put(fetchLandsSuccess(address, land, authorizations))
  } catch (error) {
    yield put(fetchLandsFailure(address, error.message))
  }
}

function* handleWallet(action: ConnectWalletSuccessAction | ChangeAccountAction) {
  const { address } = action.payload.wallet
  yield put(fetchLandsRequest(address))
}
