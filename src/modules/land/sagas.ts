import { takeLatest, call, put, takeEvery, all, getContext, take, race } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { History } from 'history'
import {
  CONNECT_WALLET_SUCCESS,
  CHANGE_ACCOUNT,
  ConnectWalletSuccessAction,
  ChangeAccountAction
} from 'decentraland-dapps/dist/modules/wallet/actions'
import {
  FETCH_TRANSACTION_FAILURE,
  FETCH_TRANSACTION_SUCCESS,
  FetchTransactionFailureAction,
  FetchTransactionSuccessAction
} from 'decentraland-dapps/dist/modules/transaction/actions'
import { getSigner } from 'decentraland-dapps/dist/lib/eth'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import {
  FETCH_LANDS_REQUEST,
  FetchLandsRequestAction,
  fetchLandsFailure,
  fetchLandsSuccess,
  fetchLandsRequest,
  TRANSFER_LAND_REQUEST,
  TransferLandRequestAction,
  transferLandSuccess,
  transferLandFailure,
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
import { locations } from 'routing/locations'
import { manager } from 'lib/api/manager'
import { rental } from 'lib/api/rentals'
import { LANDRegistry__factory } from 'contracts/factories/LANDRegistry__factory'
import { EstateRegistry__factory } from 'contracts/factories/EstateRegistry__factory'
import { Rentals__factory } from 'contracts/factories/Rentals__factory'
import { LAND_REGISTRY_ADDRESS, ESTATE_REGISTRY_ADDRESS, RENTALS_ADDRESS } from 'modules/common/contracts'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getWallet } from 'modules/wallet/utils'
import { splitCoords, buildMetadata } from './utils'
import { Land, LandType, Authorization, RoleType } from './types'

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
  const history: History = yield getContext('history')
  try {
    const wallet: Wallet = yield getWallet()
    const signer: ethers.Signer = yield getSigner()
    const from = wallet.address
    const manager = address
    switch (type) {
      case LandType.PARCEL: {
        const landRegistry = LANDRegistry__factory.connect(LAND_REGISTRY_ADDRESS, signer)
        const transaction: ethers.ContractTransaction = yield call(() => landRegistry.setUpdateManager(from, manager, isApproved))
        yield put(setUpdateManagerSuccess(address, type, isApproved, wallet.chainId, transaction.hash))
        break
      }
      case LandType.ESTATE: {
        const estateRegistry = EstateRegistry__factory.connect(ESTATE_REGISTRY_ADDRESS, signer)
        const transaction: ethers.ContractTransaction = yield call(() => estateRegistry.setUpdateManager(from, manager, isApproved))
        yield put(setUpdateManagerSuccess(address, type, isApproved, wallet.chainId, transaction.hash))
        break
      }
    }
    history.push(locations.activity())
    yield call(refreshLandsAfterTransaction, from)
  } catch (error) {
    yield put(setUpdateManagerFailure(address, type, isApproved, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleDissolveEstateRequest(action: DissolveEstateRequestAction) {
  const { land } = action.payload
  const history: History = yield getContext('history')

  try {
    if (land.type !== LandType.ESTATE) {
      throw new Error(`Invalid LandType: "${land.type}"`)
    }
    const wallet: Wallet = yield getWallet()
    const signer: ethers.Signer = yield getSigner()
    const from = wallet.address
    const landRegistry = LANDRegistry__factory.connect(LAND_REGISTRY_ADDRESS, signer)
    const estateRegistry = EstateRegistry__factory.connect(ESTATE_REGISTRY_ADDRESS, signer)
    const tokenIds: string[] = yield all(land.parcels!.map(parcel => landRegistry.encodeTokenId(parcel.x, parcel.y)))
    const transaction: ethers.ContractTransaction = yield call(() => estateRegistry.transferManyLands(land.id, tokenIds, from))
    yield put(dissolveEstateSuccess(land, wallet.chainId, transaction.hash))
    yield put(closeModal('DissolveModal'))
    history.push(locations.activity())
    yield call(refreshLandsAfterTransaction, from)
  } catch (error) {
    yield put(dissolveEstateFailure(land, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleCreateEstateRequest(action: CreateEstateRequestAction) {
  const { name, description, coords } = action.payload
  const history: History = yield getContext('history')
  try {
    const wallet: Wallet = yield getWallet()
    const signer: ethers.Signer = yield getSigner()
    const from = wallet.address
    const [xs, ys] = splitCoords(coords)
    const landRegistry = LANDRegistry__factory.connect(LAND_REGISTRY_ADDRESS, signer)
    const metadata = buildMetadata(name, description)
    const transaction: ethers.ContractTransaction = yield call(() => landRegistry.createEstateWithMetadata(xs, ys, from, metadata))

    yield put(createEstateSuccess(name, description, coords, wallet.chainId, transaction.hash))
    yield put(closeModal('EstateEditorModal'))
    history.push(locations.activity())
    yield call(refreshLandsAfterTransaction, from)
  } catch (error) {
    yield put(createEstateFailure(name, description, coords, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleEditEstateRequest(action: EditEstateRequestAction) {
  const { land, toAdd, toRemove } = action.payload
  const history: History = yield getContext('history')
  try {
    const wallet: Wallet = yield getWallet()
    const signer: ethers.Signer = yield getSigner()
    const from = wallet.address
    const landRegistry = LANDRegistry__factory.connect(LAND_REGISTRY_ADDRESS, signer)

    if (toAdd.length > 0) {
      const [xsToAdd, ysToAdd] = splitCoords(toAdd)
      const transaction: ethers.ContractTransaction = yield call(() => landRegistry.transferManyLandToEstate(xsToAdd, ysToAdd, land.id))
      yield put(editEstateSuccess(land, toAdd, 'add', wallet.chainId, transaction.hash))
    }

    if (toRemove.length > 0) {
      const estateRegistry = EstateRegistry__factory.connect(ESTATE_REGISTRY_ADDRESS, signer)
      const tokenIds: ethers.BigNumber[] = yield all(toRemove.map(({ x, y }) => landRegistry.encodeTokenId(x, y)))
      const transaction: ethers.ContractTransaction = yield call(() => estateRegistry.transferManyLands(land.id, tokenIds, from))
      yield put(editEstateSuccess(land, toRemove, 'remove', wallet.chainId, transaction.hash))
    }
    yield put(closeModal('EstateEditorModal'))
    history.push(locations.activity())
    yield call(refreshLandsAfterTransaction, from)
  } catch (error) {
    yield put(editEstateFailure(land, toAdd, toRemove, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleSetOperatorRequest(action: SetOperatorRequestAction) {
  const { land, address } = action.payload
  const history: History = yield getContext('history')

  try {
    const wallet: Wallet = yield getWallet()
    const signer: ethers.Signer = yield getSigner()
    const operator = address ?? ethers.constants.AddressZero

    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = LANDRegistry__factory.connect(LAND_REGISTRY_ADDRESS, signer)
        const tokenId: ethers.BigNumber = yield call([landRegistry, 'encodeTokenId'], land.x!, land.y!)
        let transaction: ethers.ContractTransaction

        if (land.role === RoleType.TENANT) {
          const rentals = Rentals__factory.connect(RENTALS_ADDRESS, signer)
          transaction = yield call([rentals, 'setUpdateOperator'], [LAND_REGISTRY_ADDRESS], [tokenId], [operator])
        } else {
          transaction = yield call([landRegistry, 'setUpdateOperator'], tokenId, operator)
        }
        yield put(setOperatorSuccess(land, address, wallet.chainId, transaction.hash))
        break
      }
      case LandType.ESTATE: {
        const estateRegistry = EstateRegistry__factory.connect(ESTATE_REGISTRY_ADDRESS, signer)
        let transaction: ethers.ContractTransaction

        if (land.role === RoleType.TENANT) {
          const rentals = Rentals__factory.connect(RENTALS_ADDRESS, signer)
          transaction = yield call([rentals, 'setUpdateOperator'], [ESTATE_REGISTRY_ADDRESS], [land.id], [operator])
        } else {
          transaction = yield call([estateRegistry, 'setUpdateOperator'], land.id, operator)
        }
        yield put(setOperatorSuccess(land, address, wallet.chainId, transaction.hash))
        break
      }
      default:
        throw new Error(`Unknown Land Type: ${land.type as unknown as string}`)
    }
    history.push(locations.activity())
    yield call(refreshLandsAfterTransaction, wallet.address)
  } catch (error) {
    yield put(setOperatorFailure(land, address, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleEditLandRequest(action: EditLandRequestAction) {
  const { land, name, description } = action.payload
  const history: History = yield getContext('history')

  const metadata = buildMetadata(name, description)

  try {
    const wallet: Wallet = yield getWallet()
    const signer: ethers.Signer = yield getSigner()

    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = LANDRegistry__factory.connect(LAND_REGISTRY_ADDRESS, signer)
        const transaction: ethers.ContractTransaction = yield call(() => landRegistry.updateLandData(land.x!, land.y!, metadata))
        yield put(editLandSuccess(land, name, description, wallet.chainId, transaction.hash))
        break
      }
      case LandType.ESTATE: {
        const estateRegistry = EstateRegistry__factory.connect(ESTATE_REGISTRY_ADDRESS, signer)
        const transaction: ethers.ContractTransaction = yield call(() => estateRegistry.updateMetadata(land.id, metadata))
        yield put(editLandSuccess(land, name, description, wallet.chainId, transaction.hash))
        break
      }
      default:
        throw new Error(`Unknown Land Type: ${land.type as unknown as string}`)
    }
    history.push(locations.activity())
    yield call(refreshLandsAfterTransaction, wallet.address)
  } catch (error) {
    yield put(editLandFailure(land, name, description, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleTransferLandRequest(action: TransferLandRequestAction) {
  const { land, address } = action.payload
  const history: History = yield getContext('history')

  try {
    const wallet: Wallet = yield getWallet()
    const signer: ethers.Signer = yield getSigner()
    const from = wallet.address
    const to = address

    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = LANDRegistry__factory.connect(LAND_REGISTRY_ADDRESS, signer)
        const id: ethers.BigNumber = yield call(() => landRegistry.encodeTokenId(land.x!, land.y!))
        const transaction: ethers.ContractTransaction = yield call(() => landRegistry.transferFrom(from, to, id))
        yield put(transferLandSuccess(land, address, wallet.chainId, transaction.hash))
        break
      }
      case LandType.ESTATE: {
        const estateRegistry = EstateRegistry__factory.connect(ESTATE_REGISTRY_ADDRESS, signer)
        const transaction: ethers.ContractTransaction = yield call(() => estateRegistry.transferFrom(from, to, land.id))
        yield put(transferLandSuccess(land, address, wallet.chainId, transaction.hash))
        break
      }
      default:
        throw new Error(`Unknown Land Type: ${land.type as unknown as string}`)
    }
    history.push(locations.activity())
    yield call(refreshLandsAfterTransaction, wallet.address)
  } catch (error) {
    yield put(transferLandFailure(land, address, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleFetchLandRequest(action: FetchLandsRequestAction) {
  const { address } = action.payload
  try {
    const rentals: Awaited<ReturnType<typeof rental.fetchRentalTokenIds>> = yield call([rental, 'fetchRentalTokenIds'], address)
    const tenantTokenIds = rentals.tenantRentals.map(rental => rental.tokenId)
    const lessorTokenIds = rentals.lessorRentals.map(rental => rental.tokenId)

    const [land, authorizations]: [Land[], Authorization[]] = yield call([manager, 'fetchLand'], address, tenantTokenIds, lessorTokenIds)
    yield put(fetchLandsSuccess(address, land, authorizations, rentals.tenantRentals.concat(rentals.lessorRentals)))
  } catch (error) {
    yield put(fetchLandsFailure(address, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}

function* handleWallet(action: ConnectWalletSuccessAction | ChangeAccountAction) {
  const { address } = action.payload.wallet

  yield put(fetchLandsRequest(address))
}

function* refreshLandsAfterTransaction(from: string) {
  const txnStatus: {
    success: FetchTransactionSuccessAction
    failure: FetchTransactionFailureAction
  } = yield race({
    success: take(FETCH_TRANSACTION_SUCCESS),
    failure: take(FETCH_TRANSACTION_FAILURE)
  })

  if (txnStatus.success) {
    yield put(fetchLandsRequest(from))
  }
}
