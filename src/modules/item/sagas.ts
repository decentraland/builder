import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, delay, fork, all } from 'redux-saga/effects'
import { ChainId, Network } from '@dcl/schemas'
import { AuthIdentity } from 'dcl-crypto'
import { ContractName, getContract } from 'decentraland-transactions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
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
  SET_ITEMS_TOKEN_ID_FAILURE,
  setItemsTokenIdRequest,
  setItemsTokenIdSuccess,
  setItemsTokenIdFailure,
  SetItemsTokenIdRequestAction,
  SetItemsTokenIdFailureAction,
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
  SAVE_PUBLISHED_ITEM_SUCCESS,
  DEPLOY_ITEM_CONTENTS_FAILURE,
  DeployItemContentsFailureAction,
  fetchRaritiesSuccess,
  fetchRaritiesFailure,
  FETCH_RARITIES_REQUEST,
  FETCH_ITEMS_SUCCESS
} from './actions'
import { FetchCollectionRequestAction, FETCH_COLLECTIONS_SUCCESS, FETCH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { getIdentity } from 'modules/identity/utils'
import { locations } from 'routing/locations'
import { BuilderAPI } from 'lib/api/builder'
import { getCollection, getCollectionItems, getCollections, getData as getCollectionsById } from 'modules/collection/selectors'
import { getItemId } from 'modules/location/selectors'
import { Collection } from 'modules/collection/types'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { deployContents, calculateFinalSize } from './export'
import { Item, Rarity } from './types'
import { getAuthorizedItems, getItem, getItems } from './selectors'
import { ItemTooBigError } from './errors'
import { hasOnChainDataChanged, getMetadata, isValidText, isItemSizeError, MAX_FILE_SIZE, getCatalystItemURN } from './utils'
import { fetchEntitiesRequest } from 'modules/entity/actions'

export function* itemSaga(builder: BuilderAPI) {
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
  yield takeEvery(DEPLOY_ITEM_CONTENTS_FAILURE, handleRetryDeployItemContent)
  yield takeEvery(SET_ITEMS_TOKEN_ID_FAILURE, handleRetrySetItemsTokenId)
  yield takeEvery(FETCH_RARITIES_REQUEST, handleFetchRaritiesRequest)
  yield fork(fetchItemEntities)

  function* handleFetchRaritiesRequest() {
    try {
      const rarities: Rarity[] = yield call([builder, 'fetchRarities'])
      yield put(fetchRaritiesSuccess(rarities))
    } catch (error) {
      yield put(fetchRaritiesFailure(error.message))
    }
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
      const finalSize: number = yield call(calculateFinalSize, item, contents)
      if (finalSize > MAX_FILE_SIZE) {
        throw new ItemTooBigError()
      }

      yield call(builder.saveItem, item, contents)

      yield put(saveItemSuccess(item, contents))
    } catch (error) {
      yield put(saveItemFailure(actionItem, contents, error.message))
    }
  }

  function* handleSavePublishedItemRequest(action: SavePublishedItemRequestAction) {
    const { item: actionItem, contents } = action.payload
    try {
      const item = { ...actionItem, updatedAt: Date.now() }
      const items: ReturnType<typeof getItems> = yield select(getItems)
      const collections: ReturnType<typeof getCollections> = yield select(getCollections)
      const originalItem = items.find(_item => _item.id === item.id)
      const collection = collections.find(_collection => _collection.id === item.collectionId)

      if (!isValidText(item.name) || !isValidText(item.description)) {
        throw new Error(t('sagas.item.invalid_character'))
      }
      if (!originalItem || !collection) {
        throw new Error(t('sagas.item.not_found'))
      }
      if (!originalItem.isPublished) {
        throw new Error(t('sagas.item.cant_persist_unpublished'))
      }
      if (!originalItem.collectionId) {
        throw new Error(t('sagas.item.cant_save_without_collection'))
      }

      const finalSize: number = yield call(calculateFinalSize, item, contents)
      if (finalSize > MAX_FILE_SIZE) {
        throw new ItemTooBigError()
      }

      let txHash: string | undefined
      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)

      // Items should be uploaded to the builder server in order to be available to be added to the catalysts
      yield call(builder.saveItemContents, item, contents)

      if (hasOnChainDataChanged(originalItem, item)) {
        const metadata = getMetadata(item)
        const contract = { ...getContract(ContractName.ERC721CollectionV2, maticChainId), address: collection.contractAddress! }
        txHash = yield call(sendTransaction, contract, collection =>
          collection.editItemsData([item.tokenId!], [item.price!], [item.beneficiary!], [metadata])
        )
      } else {
        yield put(saveItemRequest(item, contents))
      }

      yield put(savePublishedItemSuccess(item, maticChainId, txHash))
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
    const { collection, items } = action.payload

    try {
      const { items: newItems }: { items: Item[] } = yield call(() => builder.publishCollection(collection.id))
      yield put(setItemsTokenIdSuccess(newItems))
    } catch (error) {
      yield put(setItemsTokenIdFailure(collection, items, error.message))
    }
  }

  function* handleRetrySetItemsTokenId(action: SetItemsTokenIdFailureAction) {
    const { collection } = action.payload

    yield delay(5000) // wait five seconds

    // Refresh data from state
    const newCollection: Collection = yield select(state => getCollection(state, collection.id))
    const newItems: Item[] = yield select(state => getCollectionItems(state, collection.id))
    yield put(setItemsTokenIdRequest(newCollection, newItems))
  }

  function* handleDeployItemContentsRequest(action: DeployItemContentsRequestAction) {
    const { collection, item } = action.payload

    try {
      const identity: AuthIdentity | undefined = yield getIdentity()
      if (!identity) {
        throw new Error(t('sagas.item.invalid_identity'))
      }

      const deployedItem: Item = yield deployContents(identity, collection, item)

      yield put(deployItemContentsSuccess(collection, deployedItem))
    } catch (error) {
      yield put(deployItemContentsFailure(collection, item, error.message))
    }
  }

  function* handleRetryDeployItemContent(action: DeployItemContentsFailureAction) {
    const { collection, item, error } = action.payload

    if (isItemSizeError(error)) {
      return
    }

    yield delay(5000) // wait five seconds

    // Refresh data from state
    const newCollection: Collection = yield select(state => getCollection(state, collection.id))
    const newItem: Item = yield select(state => getItem(state, item.id))
    yield put(deployItemContentsRequest(newCollection, newItem))
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

  function* fetchItemEntities() {
    while (true) {
      yield all([take(FETCH_ITEMS_SUCCESS), take(FETCH_COLLECTIONS_SUCCESS)])
      const items: Item[] = yield select(getAuthorizedItems)
      const collectionsById: Record<string, Collection> = yield select(getCollectionsById)
      const urns = items
        .filter(item => item.isPublished)
        .map(item => getCatalystItemURN(collectionsById[item.collectionId!].contractAddress!, item.tokenId!))
      yield put(fetchEntitiesRequest({ filters: { pointers: urns } }))
    }
  }
}
