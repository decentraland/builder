import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { replace } from 'connected-react-router'
import { select, take, takeEvery, call, put, takeLatest } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import {
  FetchCollectionsRequestAction,
  FetchCollectionsSuccessAction,
  fetchCollectionsRequest,
  fetchCollectionsSuccess,
  fetchCollectionsFailure,
  FETCH_COLLECTIONS_REQUEST,
  FETCH_COLLECTIONS_SUCCESS,
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
  PUBLISH_COLLECTION_REQUEST,
  SetCollectionMintersRequestAction,
  setCollectionMintersSuccess,
  setCollectionMintersFailure,
  SET_COLLECTION_MINTERS_REQUEST,
  SetCollectionManagersRequestAction,
  setCollectionManagersSuccess,
  setCollectionManagersFailure,
  SET_COLLECTION_MANAGERS_REQUEST,
  MintCollectionItemsRequestAction,
  mintCollectionItemsSuccess,
  mintCollectionItemsFailure,
  MINT_COLLECTION_ITEMS_REQUEST,
  PUBLISH_COLLECTION_SUCCESS
} from './actions'
import { getCurrentAddress } from 'modules/wallet/utils'
import { ERC721_COLLECTION_FACTORY_ADDRESS, ERC721_COLLECTION_ADDRESS } from 'modules/common/contracts'
import { ERC721CollectionFactoryV2 } from 'contracts/ERC721CollectionFactoryV2'
import { ERC721CollectionV2 } from 'contracts/ERC721CollectionV2'
import { setItemsTokenIdRequest, deployItemContentsRequest, FETCH_ITEMS_SUCCESS } from 'modules/item/actions'
import { locations } from 'routing/locations'
import { getCollectionId } from 'modules/location/selectors'
import { builder } from 'lib/api/builder'
import { closeModal } from 'modules/modal/actions'
import { Item } from 'modules/item/types'
import { getItems } from 'modules/item/selectors'
import { getCollection, getCollectionItems } from './selectors'
import { Collection } from './types'
import { initializeCollection } from './utils'

export function* collectionSaga() {
  yield takeEvery(FETCH_COLLECTIONS_REQUEST, handleFetchCollectionsRequest)
  yield takeEvery(SAVE_COLLECTION_REQUEST, handleSaveCollectionRequest)
  yield takeEvery(DELETE_COLLECTION_REQUEST, handleDeleteCollectionRequest)
  yield takeEvery(PUBLISH_COLLECTION_REQUEST, handlePublishCollectionRequest)
  yield takeEvery(SET_COLLECTION_MINTERS_REQUEST, handleSetCollectionMintersRequest)
  yield takeEvery(SET_COLLECTION_MANAGERS_REQUEST, handleSetCollectionManagersRequest)
  yield takeEvery(MINT_COLLECTION_ITEMS_REQUEST, handleMintColectionItems)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeLatest(FETCH_TRANSACTION_SUCCESS, handleTransactionSuccess)
  yield takeLatest(FETCH_COLLECTIONS_SUCCESS, handleRequestCollectionSuccess)
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
    const remoteCollection = yield call(() => builder.saveCollection(collection))
    const newCollection = { ...collection, ...remoteCollection }
    yield put(saveCollectionSuccess(newCollection))
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
    const collectionIdInUriParam = yield select(getCollectionId)
    if (collectionIdInUriParam === collection.id) {
      yield put(replace(locations.avatar()))
    }
  } catch (error) {
    yield put(deleteCollectionFailure(collection, error.message))
  }
}

function* handlePublishCollectionRequest(action: PublishCollectionRequestAction) {
  const { collection, items } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()

    const factory = new ERC721CollectionFactoryV2(eth, Address.fromString(ERC721_COLLECTION_FACTORY_ADDRESS))
    const implementation = new ERC721CollectionV2(eth, Address.fromString(ERC721_COLLECTION_ADDRESS))

    const data = initializeCollection(implementation, collection, items, from)

    const txHash = yield call(() =>
      factory.methods
        .createCollection(collection.salt!, data.toString())
        .send({ from })
        .getTxHash()
    )
    const tokenIds: string[] = Object.keys(items)

    yield put(publishCollectionSuccess(collection, items, txHash))
    yield put(setItemsTokenIdRequest(items, tokenIds))
    yield put(replace(locations.activity()))
  } catch (error) {
    yield put(publishCollectionFailure(collection, items, error.message))
  }
}

function* handleSetCollectionMintersRequest(action: SetCollectionMintersRequestAction) {
  const { collection, accessList } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()

    const implementation = new ERC721CollectionV2(eth, Address.fromString(collection.contractAddress!))

    const addresses: Address[] = []
    const values: boolean[] = []

    const newMinters = new Set(collection.minters)

    for (const { address, hasAccess } of accessList) {
      addresses.push(Address.fromString(address))
      values.push(hasAccess)

      if (hasAccess) {
        newMinters.add(address)
      } else {
        newMinters.delete(address)
      }
    }

    const txHash = yield call(() =>
      implementation.methods
        .setMinters(addresses, values)
        .send({ from })
        .getTxHash()
    )

    yield put(setCollectionMintersSuccess(collection, Array.from(newMinters), txHash))
    yield put(replace(locations.activity()))
  } catch (error) {
    yield put(setCollectionMintersFailure(collection, accessList, error.message))
  }
}

function* handleSetCollectionManagersRequest(action: SetCollectionManagersRequestAction) {
  const { collection, accessList } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()

    const implementation = new ERC721CollectionV2(eth, Address.fromString(collection.contractAddress!))

    const addresses: Address[] = []
    const values: boolean[] = []

    const newManagers = new Set(collection.managers)

    for (const { address, hasAccess } of accessList) {
      addresses.push(Address.fromString(address))
      values.push(hasAccess)

      if (hasAccess) {
        newManagers.add(address)
      } else {
        newManagers.delete(address)
      }
    }

    const txHash = yield call(() =>
      implementation.methods
        .setManagers(addresses, values)
        .send({ from })
        .getTxHash()
    )

    yield put(setCollectionManagersSuccess(collection, Array.from(newManagers), txHash))
    yield put(replace(locations.activity()))
  } catch (error) {
    yield put(setCollectionManagersFailure(collection, accessList, error.message))
  }
}

function* handleMintColectionItems(action: MintCollectionItemsRequestAction) {
  const { collection, mints } = action.payload
  try {
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()

    const implementation = new ERC721CollectionV2(eth, Address.fromString(collection.contractAddress!))
    const beneficiaries: Address[] = []
    const tokenIds: string[] = []

    for (const mint of mints) {
      const beneficiary = Address.fromString(mint.address)
      for (let i = 0; i < mint.amount; i++) {
        beneficiaries.push(beneficiary)
        tokenIds.push(mint.item.tokenId!)
      }
    }

    const txHash = yield call(() =>
      implementation.methods
        .issueTokens(beneficiaries, tokenIds)
        .send({ from })
        .getTxHash()
    )

    yield put(mintCollectionItemsSuccess(collection, mints, txHash))
    yield put(closeModal('MintItemsModal'))
    yield put(replace(locations.activity()))
  } catch (error) {
    yield put(mintCollectionItemsFailure(collection, mints, error.message))
  }
}

function* handleConnectWalletSuccess() {
  yield put(fetchCollectionsRequest())
}

function* handleTransactionSuccess(action: FetchTransactionSuccessAction) {
  const transaction = action.payload.transaction

  try {
    switch (transaction.actionType) {
      case PUBLISH_COLLECTION_SUCCESS: {
        // We re-fetch the collection from the store to get the updated version
        const collectionId = transaction.payload.collection.id
        const collection = yield select(state => getCollection(state, collectionId))
        const items = yield select(state => getCollectionItems(state, collectionId))

        yield deployItems(collection, items)
        break
      }
      default: {
        break
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function* handleRequestCollectionSuccess(action: FetchCollectionsSuccessAction) {
  const allItems: Item[] = yield select(getItems)
  if (allItems.length === 0) {
    yield take(FETCH_ITEMS_SUCCESS)
  }

  try {
    const { collections } = action.payload

    for (const collection of collections) {
      if (!collection.isPublished) continue
      const items = allItems.filter(item => item.collectionId === collection.id)
      yield deployItems(collection, items)
    }
  } catch (error) {
    console.error(error)
  }
}

function* deployItems(collection: Collection, items: Item[]) {
  for (const item of items) {
    if (!item.inCatalyst) {
      yield put(deployItemContentsRequest(collection, item))
    }
  }
}
