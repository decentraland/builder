import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, all } from 'redux-saga/effects'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import {
  FETCH_ITEMS_REQUEST,
  FetchItemsRequestAction,
  fetchItemsSuccess,
  fetchItemsFailure,
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
  fetchItemsRequest,
  SET_COLLECTION,
  SetCollectionAction,
  SET_ITEMS_TOKEN_ID_REQUEST,
  setItemsTokenIdSuccess,
  setItemsTokenIdFailure,
  SetItemsTokenIdRequestAction,
  DEPLOY_ITEM_CONTENTS_REQUEST,
  deployItemContentsSuccess,
  deployItemContentsFailure,
  DeployItemContentsRequestAction
} from './actions'
import { getCurrentAddress } from 'modules/wallet/utils'
import { getIdentity } from 'modules/identity/utils'
import { ERC721CollectionV2 } from 'contracts/ERC721CollectionV2'
import { locations } from 'routing/locations'
import { builder } from 'lib/api/builder'
import { getCollection } from 'modules/collection/selectors'
import { getItemId } from 'modules/location/selectors'
import { Collection } from 'modules/collection/types'
import { deployContents } from './export'
import { Item } from './types'

export function* itemSaga() {
  yield takeEvery(FETCH_ITEMS_REQUEST, handleFetchItemsRequest)
  yield takeEvery(SAVE_ITEM_REQUEST, handleSaveItemRequest)
  yield takeEvery(SAVE_PUBLISHED_ITEM_REQUEST, handleSavePublishedItemRequest)
  yield takeEvery(DELETE_ITEM_REQUEST, handleDeleteItemRequest)
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeLatest(SET_COLLECTION, handleSetCollection)
  yield takeLatest(SET_ITEMS_TOKEN_ID_REQUEST, handleSetItemsTokenIdRequest)
  yield takeLatest(DEPLOY_ITEM_CONTENTS_REQUEST, handleDeployItemContentsRequest)
}

function* handleFetchItemsRequest(_action: FetchItemsRequestAction) {
  try {
    const items = yield call(() => builder.fetchItems())
    yield put(fetchItemsSuccess(items))
  } catch (error) {
    yield put(fetchItemsFailure(error.message))
  }
}

function* handleSaveItemRequest(action: SaveItemRequestAction) {
  const { item, contents } = action.payload
  try {
    const itemWithUpdatedDate = { ...item, updatedAt: Date.now() }
    yield call(() => saveItem(itemWithUpdatedDate, contents))
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
    const [from, eth]: [Address, Eth] = yield getCurrentAddress()

    const implementation = new ERC721CollectionV2(eth, Address.fromString(collection.contractAddress!))

    const txHash = yield call(() =>
      implementation.methods
        .editItemsSalesData([item.tokenId!], [item.price!], [Address.fromString(item.beneficiary!)])
        .send({ from })
        .getTxHash()
    )

    yield put(savePublishedItemSuccess(item, txHash))
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

function* handleConnectWalletSuccess() {
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
      saves.push(call(() => saveItem(newItem)))
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

export function saveItem(item: Item, contents: Record<string, Blob> = {}) {
  return builder.saveItem(item, contents)
}
