import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, all } from 'redux-saga/effects'
import { ChainId } from '@dcl/schemas'
import { AuthIdentity } from 'dcl-crypto'
import { ContractName, getContract } from 'decentraland-transactions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getChainId } from 'decentraland-dapps/dist/modules/wallet/selectors'
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
  SAVE_PUBLISHED_ITEM_SUCCESS
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
import { deployContents, calculateFinalSize } from './export'
import { Item } from './types'
import { getItem } from './selectors'
import { ItemTooBigError } from './errors'
import { hasOnChainDataChanged, getMetadata, isValidText, MAX_FILE_SIZE } from './utils'

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
  yield takeEvery(DEPLOY_ITEM_CONTENTS_REQUEST, handleDeployItemContentsRequest)
  yield takeEvery(FETCH_COLLECTION_REQUEST, handleFetchCollectionRequest)
  yield takeLatest(FETCH_TRANSACTION_SUCCESS, handleTransactionSuccess)
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
  const { item: actionItem, contents } = action.payload
  try {
    const item = { ...actionItem, updatedAt: Date.now() }

    if (!isValidText(item.name) || !isValidText(item.description)) {
      throw new Error(t('sagas.item.invalid_character'))
    }
    if (item.isPublished) {
      throw new Error(t('sagas.item.cant_save_published'))
    }
    const finalSize: number = yield call(() => calculateFinalSize(item, contents))
    if (finalSize > MAX_FILE_SIZE) {
      throw new ItemTooBigError()
    }

    yield call(() => builder.saveItem(item, contents))

    yield put(saveItemSuccess(item, contents))
    yield put(closeModal('CreateItemModal'))
    yield put(closeModal('EditPriceAndBeneficiaryModal'))
  } catch (error) {
    yield put(saveItemFailure(actionItem, contents, error.message))
  }
}

function* handleSavePublishedItemRequest(action: SavePublishedItemRequestAction) {
  const { item: actionItem, contents } = action.payload
  try {
    const item = { ...actionItem, updatedAt: Date.now() }
    const originalItem: Item = yield select(state => getItem(state, item.id))
    const collection: Collection = yield select(state => getCollection(state, item.collectionId!))

    if (!isValidText(item.name) || !isValidText(item.description)) {
      throw new Error(t('sagas.item.invalid_character'))
    }
    if (!originalItem.isPublished) {
      throw new Error(t('sagas.item.cant_persist_unpublished'))
    }
    if (!originalItem.collectionId) {
      throw new Error(t('sagas.item.cant_save_without_collection'))
    }

    const finalSize: number = yield call(() => calculateFinalSize(item, contents))
    if (finalSize > MAX_FILE_SIZE) {
      throw new ItemTooBigError()
    }

    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    const maticChainId = wallet.networks.MATIC.chainId
    let txHash: string | undefined

    // Items should be uploaded to the builder server in order to be available to be added to the catalysts
    yield call(() => builder.saveItemContents(item, contents))

    if (hasOnChainDataChanged(originalItem, item)) {
      const metadata = getMetadata(item)
      const implementation = new ERC721CollectionV2(eth, Address.fromString(collection.contractAddress!))

      const contract = { ...getContract(ContractName.ERC721CollectionV2, maticChainId), address: collection.contractAddress! }
      txHash = yield sendWalletMetaTransaction(
        contract,
        implementation.methods.editItemsData([item.tokenId!], [item.price!], [Address.fromString(item.beneficiary!)], [metadata])
      )
    } else {
      yield put(deployItemContentsRequest(collection, item))
    }

    yield put(savePublishedItemSuccess(item, maticChainId, txHash))
    yield put(closeModal('CreateItemModal'))
    yield put(closeModal('EditPriceAndBeneficiaryModal'))
  } catch (error) {
    yield put(savePublishedItemFailure(actionItem, contents, error.message))
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
      saves.push(call(() => builder.saveItem(newItem, {})))
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
    const identity: AuthIdentity | undefined = yield getIdentity()
    if (!identity) {
      throw new Error(t('sagas.item.invalid_identity'))
    }

    const chainId: ChainId = yield select(getChainId)
    const deployedItem: Item = yield deployContents(identity, collection, item, chainId)

    yield put(deployItemContentsSuccess(collection, deployedItem))
  } catch (error) {
    yield put(deployItemContentsFailure(collection, item, error.message))
  }
}

function* handleFetchCollectionRequest(action: FetchCollectionRequestAction) {
  const { id } = action.payload
  yield put(fetchCollectionItemsRequest(id))
}

function* handleTransactionSuccess(action: FetchTransactionSuccessAction) {
  const transaction = action.payload.transaction

  try {
    switch (transaction.actionType) {
      case SAVE_PUBLISHED_ITEM_SUCCESS: {
        const { item } = transaction.payload
        const collection: Collection = yield select(state => getCollection(state, item.collectionId!))
        yield put(deployItemContentsRequest(collection, item))
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
