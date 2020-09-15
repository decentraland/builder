import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select } from 'redux-saga/effects'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import {
  FETCH_COLLECTIONS_REQUEST,
  FetchCollectionsRequestAction,
  fetchCollectionsRequest,
  fetchCollectionsSuccess,
  fetchCollectionsFailure,
  SaveCollectionRequestAction,
  saveCollectionSuccess,
  saveCollectionFailure,
  SAVE_COLLECTION_REQUEST,
  DeleteCollectionRequestAction,
  deleteCollectionSuccess,
  deleteCollectionFailure,
  DELETE_COLLECTION_REQUEST,
  PublishCollectionRequestAction,
  publishCollectionSuccess,
  publishCollectionFailure,
  PUBLISH_COLLECTION_REQUEST
} from './actions'
import { initializeCollection } from './utils'
import { ERC721_COLLECTION_FACTORY_ADDRESS, ERC721_COLLECTION_ADDRESS } from 'modules/common/contracts'
import { ERC721CollectionFactoryV2 } from 'contracts/ERC721CollectionFactoryV2'
import { ERC721CollectionV2 } from 'contracts/ERC721CollectionV2'
import { locations } from 'routing/locations'
import { builder } from 'lib/api/builder'
import { closeModal } from 'modules/modal/actions'

export function* collectionSaga() {
  yield takeEvery(FETCH_COLLECTIONS_REQUEST, handleFetchCollectionsRequest)
  yield takeEvery(SAVE_COLLECTION_REQUEST, handleSaveCollectionRequest)
  yield takeEvery(DELETE_COLLECTION_REQUEST, handleDeleteCollectionRequest)
  yield takeEvery(PUBLISH_COLLECTION_REQUEST, handlePublishCollectionRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
}

function* handleFetchCollectionsRequest(_action: FetchCollectionsRequestAction) {
  try {
    const collections = yield call(() => builder.fetchCollections())
    yield put(fetchCollectionsSuccess(collections))
    yield put(closeModal('CreateCollectionModal'))
  } catch (error) {
    yield put(fetchCollectionsFailure(error.message))
  }
}

function* handleSaveCollectionRequest(action: SaveCollectionRequestAction) {
  const { collection } = action.payload
  try {
    yield call(() => builder.saveCollection(collection))
    yield put(saveCollectionSuccess(collection))
    yield put(closeModal('CreateCollectionModal'))
  } catch (error) {
    yield put(saveCollectionFailure(collection, error.message))
  }
}

function* handleDeleteCollectionRequest(action: DeleteCollectionRequestAction) {
  const { collection } = action.payload
  try {
    yield call(() => builder.deleteCollection(collection))
    yield put(deleteCollectionSuccess(collection))
  } catch (error) {
    yield put(deleteCollectionFailure(collection, error.message))
  }
}

function* handlePublishCollectionRequest(action: PublishCollectionRequestAction) {
  const { collection, items } = action.payload
  try {
    const eth = Eth.fromCurrentProvider()
    if (!eth) {
      throw new Error('Wallet not found')
    }

    const fromAddress = yield select(getAddress)
    if (!fromAddress) {
      throw new Error(`Invalid from address: ${fromAddress}`)
    }

    const from = Address.fromString(fromAddress)

    const factory = new ERC721CollectionFactoryV2(eth, Address.fromString(ERC721_COLLECTION_FACTORY_ADDRESS))
    const implementation = new ERC721CollectionV2(eth, Address.fromString(ERC721_COLLECTION_ADDRESS))

    const data = initializeCollection(implementation, collection, items, from)

    const txHash = yield call(() =>
      factory.methods
        .createCollection(collection.salt!, data.toString())
        .send({ from })
        .getTxHash()
    )

    yield put(publishCollectionSuccess(collection, items, txHash))
    yield put(replace(locations.activity()))
  } catch (error) {
    yield put(publishCollectionFailure(collection, items, error.message))
  }
}

function* handleConnectWalletSuccess() {
  yield put(fetchCollectionsRequest())
}
