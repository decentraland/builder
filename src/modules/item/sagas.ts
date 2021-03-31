import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, all, race } from 'redux-saga/effects'
import { ContractName } from 'decentraland-transactions'
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
  fetchCollectionItemsRequest,
  DeployItemContentsSuccessAction,
  DeployItemContentsFailureAction,
  DEPLOY_ITEM_CONTENTS_SUCCESS,
  DEPLOY_ITEM_CONTENTS_FAILURE
} from './actions'
import { FetchCollectionRequestAction, FETCH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { getWallet, sendWalletMetaTransaction } from 'modules/wallet/utils'
import { getIdentity } from 'modules/identity/utils'
import { ERC721CollectionV2 } from 'contracts/ERC721CollectionV2'
import { locations } from 'routing/locations'
import { builder } from 'lib/api/builder'
import { getCollection } from 'modules/collection/selectors'
import { getItemId } from 'modules/location/selectors'
import { Collection } from 'modules/collection/types'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { deployContents } from './export'
import { Item } from './types'
import { getItem } from './selectors'
import { hasOnChainDataChanged, getMetadata } from './utils'

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

function* handleFetchItemsRequest(action: FetchItemsRequestAction) {
  const { address } = action.payload
  try {
    const items: Item[] = yield call(() => builder.fetchItems(address))
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
      throw new Error('Item should not be published to save it')
    }

    yield call(() => saveUnpublishedItem(itemWithUpdatedDate, contents))

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
    const originalItem: Item = yield select(state => getItem(state, item.id))

    if (!originalItem.isPublished) {
      throw new Error('Item must be published to save it')
    }
    if (!originalItem.collectionId) {
      throw new Error("Can't save a published without a collection")
    }

    const collection: Collection = yield select(state => getCollection(state, item.collectionId!))
    yield put(deployItemContentsRequest(collection, item))

    const {
      failure
    }: {
      success: DeployItemContentsSuccessAction | null
      failure: DeployItemContentsFailureAction | null
    } = yield race({
      success: take(DEPLOY_ITEM_CONTENTS_SUCCESS),
      failure: take(DEPLOY_ITEM_CONTENTS_FAILURE)
    })

    if (failure) {
      throw new Error('Failed to upload items to the content server')
    }

    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    let txHash: string | undefined

    if (hasOnChainDataChanged(originalItem, item)) {
      // The user has only changed the item file
      txHash = yield savePublishedItem(eth, collection, item)
    }

    yield put(savePublishedItemSuccess(item, wallet.networks.MATIC.chainId, txHash))
    yield put(closeModal('CreateItemModal'))
    yield put(closeModal('EditPriceAndBeneficiaryModal'))

    if (txHash) {
      yield put(replace(locations.activity()))
    }
  } catch (error) {
    yield put(savePublishedItemFailure(item, error.message))
  }
}

function* handleDeleteItemRequest(action: DeleteItemRequestAction) {
  const { item } = action.payload
  try {
    yield call(() => builder.deleteItem(item))
    yield put(deleteItemSuccess(item))
    const itemIdInUriParam: string = yield select(getItemId)
    if (itemIdInUriParam === item.id) {
      yield put(replace(locations.collections()))
    }
  } catch (error) {
    yield put(deleteItemFailure(item, error.message))
  }
}

function* handleLoginSuccess(action: LoginSuccessAction) {
  const { wallet } = action.payload
  yield put(fetchItemsRequest(wallet.address))
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

    const deployedItem = yield deployContents(identity, collection, item)

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

export function* savePublishedItem(eth: Eth, collection: Collection, item: Item) {
  const metadata = getMetadata(item)
  const implementation = new ERC721CollectionV2(eth, Address.fromString(collection.contractAddress!))

  return yield sendWalletMetaTransaction(
    ContractName.ERC721CollectionV2,
    implementation.methods.editItemsData([item.tokenId!], [item.price!], [Address.fromString(item.beneficiary!)], [metadata]),
    collection.contractAddress!
  )
}
