import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, all } from 'redux-saga/effects'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import {
  FetchItemsRequestAction,
  fetchItemsRequest,
  fetchItemsSuccess,
  fetchItemsFailure,
  FETCH_ITEMS_REQUEST,
  FetchItemRequestAction,
  fetchItemSuccess,
  fetchItemFailure,
  FETCH_ITEM_REQUEST,
  SaveItemRequestAction,
  saveItemRequest,
  saveItemSuccess,
  saveItemFailure,
  SAVE_ITEM_REQUEST,
  SAVE_ITEM_SUCCESS,
  SavePublishedItemRequestAction,
  savePublishedItemSuccess,
  savePublishedItemFailure,
  SAVE_PUBLISHED_ITEM_REQUEST,
  DeleteItemRequestAction,
  deleteItemSuccess,
  deleteItemFailure,
  DELETE_ITEM_REQUEST,
  SET_COLLECTION,
  SetCollectionAction,
  SET_ITEMS_TOKEN_ID_REQUEST,
  setItemsTokenIdSuccess,
  setItemsTokenIdFailure,
  SetItemsTokenIdRequestAction,
  deployItemContentsRequest,
  DEPLOY_ITEM_CONTENTS_REQUEST,
  deployItemContentsSuccess,
  deployItemContentsFailure,
  DeployItemContentsRequestAction,
  FETCH_COLLECTION_ITEMS_REQUEST,
  FetchCollectionItemsRequestAction,
  fetchCollectionItemsSuccess,
  fetchCollectionItemsFailure,
  fetchCollectionItemsRequest
} from './actions'
import { FetchCollectionRequestAction, FETCH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { getWallet } from 'modules/wallet/utils'
import { getIdentity } from 'modules/identity/utils'
import { ERC721CollectionV2 } from 'contracts/ERC721CollectionV2'
import { locations } from 'routing/locations'
import { builder } from 'lib/api/builder'
import { getCollection } from 'modules/collection/selectors'
import { getItemId } from 'modules/location/selectors'
import { Collection } from 'modules/collection/types'
import { LOGIN_SUCCESS } from 'modules/identity/actions'
import { deployContents } from './export'
import { Item } from './types'
import { getItem } from './selectors'
import { hasMetadataChanged, getMetadata } from './utils'

export function* itemSaga() {
  yield takeEvery(FETCH_ITEMS_REQUEST, handleFetchItemsRequest)
  yield takeEvery(FETCH_ITEM_REQUEST, handleFetchItemRequest)
  yield takeEvery(FETCH_COLLECTION_ITEMS_REQUEST, handleFetchCollectionItemsRequest)
  yield takeEvery(SAVE_ITEM_REQUEST, handleSaveItemRequest)
  yield takeEvery(SAVE_PUBLISHED_ITEM_REQUEST, handleSavePublishedItemRequest)
  yield takeEvery(DELETE_ITEM_REQUEST, handleDeleteItemRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(SET_COLLECTION, handleSetCollection)
  yield takeLatest(SET_ITEMS_TOKEN_ID_REQUEST, handleSetItemsTokenIdRequest)
  yield takeLatest(DEPLOY_ITEM_CONTENTS_REQUEST, handleDeployItemContentsRequest)
  yield takeEvery(FETCH_COLLECTION_REQUEST, handleFetchCollectionRequest)
}

function* handleFetchItemsRequest(_action: FetchItemsRequestAction) {
  try {
    const items: Item[] = yield call(() => builder.fetchItems())
    yield put(fetchItemsSuccess(items))
  } catch (error) {
    yield put(fetchItemsFailure(error.message))
  }
}

function* handleFetchItemRequest(action: FetchItemRequestAction) {
  const { id } = action.payload
  try {
    const item: Item = yield call(() => builder.fetchItem(id))
    yield put(fetchItemSuccess(id, item))
  } catch (error) {
    yield put(fetchItemFailure(id, error.message))
  }
}

function* handleFetchCollectionItemsRequest(action: FetchCollectionItemsRequestAction) {
  const { collectionId } = action.payload
  try {
    const items: Item[] = yield call(() => builder.fetchCollectionItems(collectionId))
    yield put(fetchCollectionItemsSuccess(collectionId, items))
  } catch (error) {
    yield put(fetchCollectionItemsFailure(collectionId, error.message))
  }
}

function* handleSaveItemRequest(action: SaveItemRequestAction) {
  const { item, contents } = action.payload
  try {
    const itemWithUpdatedDate = { ...item, updatedAt: Date.now() }
    if (itemWithUpdatedDate.isPublished) {
      const collection: Collection = yield select(state => getCollection(state, item.collectionId!))
      yield put(deployItemContentsRequest(collection, itemWithUpdatedDate))

      const originalItem = yield select(state => getItem(state, item.id))
      if (hasMetadataChanged(originalItem, item)) {
        yield call(() => savePublishedItem(itemWithUpdatedDate))
      }
    } else {
      yield call(() => saveUnpublishedItem(itemWithUpdatedDate, contents))
    }
    yield put(saveItemSuccess(itemWithUpdatedDate, contents))
    yield put(closeModal('CreateItemModal'))
    yield put(closeModal('EditPriceAndBeneficiaryModal'))
  } catch (error) {
    yield put(saveItemFailure(item, contents, error.message))
  }
}

function* handleSavePublishedItemRequest(action: SavePublishedItemRequestAction) {
  const { item } = action.payload
  try {
    if (!item.isPublished) {
      throw new Error('Item must be published to save it')
    }
    if (!item.collectionId) {
      throw new Error("Can't save a published without a collection")
    }
    const collection: Collection = yield select(state => getCollection(state, item.collectionId!))
    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    const from = Address.fromString(wallet.address)

    const implementation = new ERC721CollectionV2(eth, Address.fromString(collection.contractAddress!))

    const txHash = yield call(() =>
      implementation.methods
        .editItemsSalesData([item.tokenId!], [item.price!], [Address.fromString(item.beneficiary!)])
        .send({ from })
        .getTxHash()
    )

    yield put(savePublishedItemSuccess(item, wallet.chainId, txHash))
    yield put(closeModal('EditPriceAndBeneficiaryModal'))
    yield put(replace(locations.activity()))
  } catch (error) {
    yield put(savePublishedItemFailure(item, error.message))
  }
}

function* handleDeleteItemRequest(action: DeleteItemRequestAction) {
  const { item } = action.payload
  try {
    yield call(() => builder.deleteItem(item))
    yield put(deleteItemSuccess(item))
    const itemIdInUriParam = yield select(getItemId)
    if (itemIdInUriParam === item.id) {
      yield put(replace(locations.avatar()))
    }
  } catch (error) {
    yield put(deleteItemFailure(item, error.message))
  }
}

function* handleLoginSuccess() {
  yield put(fetchItemsRequest())
}

function* handleSetCollection(action: SetCollectionAction) {
  const { item, collectionId } = action.payload
  const newItem = { ...item }
  if (collectionId === null) {
    delete newItem.collectionId
  } else {
    newItem.collectionId = collectionId
  }
  yield put(saveItemRequest(newItem, {}))
  yield take(SAVE_ITEM_SUCCESS)
  yield put(closeModal('AddExistingItemModal'))
}

function* handleSetItemsTokenIdRequest(action: SetItemsTokenIdRequestAction) {
  const { items, tokenIds } = action.payload

  try {
    const saves = []
    const newItems = []
    for (const [index, item] of items.entries()) {
      const tokenId = tokenIds[index]
      const newItem = {
        ...item,
        tokenId
      }
      saves.push(call(() => saveUnpublishedItem(newItem)))
      newItems.push(newItem)
    }

    yield all(saves)
    yield put(setItemsTokenIdSuccess(newItems, tokenIds))
  } catch (error) {
    yield put(setItemsTokenIdFailure(items, error.message))
  }
}

function* handleDeployItemContentsRequest(action: DeployItemContentsRequestAction) {
  const { collection, item } = action.payload

  try {
    const identity = yield getIdentity()
    if (!identity) {
      throw new Error('Invalid identity')
    }

    const deployedItem = item.inCatalyst ? item : yield deployContents(identity, collection, item)

    yield put(deployItemContentsSuccess(collection, deployedItem))
  } catch (error) {
    yield put(deployItemContentsFailure(collection, item, error.message))
  }
}

function* handleFetchCollectionRequest(action: FetchCollectionRequestAction) {
  const { id } = action.payload
  yield put(fetchCollectionItemsRequest(id))
}

export function saveUnpublishedItem(item: Item, contents: Record<string, Blob> = {}) {
  return builder.saveItem(item, contents)
}

export function savePublishedItem(item: Item) {
  const metadata = getMetadata(item)
  // @TODO: send meta transaction with metadata update

  console.log('changed: ', metadata, item.price, item.beneficiary)
}
