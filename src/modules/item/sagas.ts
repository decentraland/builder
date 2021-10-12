import { Contract } from 'ethers'
import { replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, delay, fork, all, race } from 'redux-saga/effects'
import { ChainId, Network } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
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
  FETCH_COLLECTION_ITEMS_REQUEST,
  FetchCollectionItemsRequestAction,
  fetchCollectionItemsSuccess,
  fetchCollectionItemsFailure,
  fetchCollectionItemsRequest,
  fetchRaritiesSuccess,
  fetchRaritiesFailure,
  FETCH_RARITIES_REQUEST,
  FETCH_ITEMS_SUCCESS,
  RESCUE_ITEMS_REQUEST,
  RescueItemsRequestAction,
  rescueItemsSuccess,
  rescueItemsFailure,
  ResetItemRequestAction,
  RESET_ITEM_REQUEST,
  resetItemSuccess,
  resetItemFailure,
  SAVE_ITEM_FAILURE,
  SaveItemSuccessAction,
  SaveItemFailureAction
} from './actions'
import { FetchCollectionRequestAction, FETCH_COLLECTIONS_SUCCESS, FETCH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { locations } from 'routing/locations'
import { BuilderAPI } from 'lib/api/builder'
import { getCollection, getCollectionItems, getCollections, getData as getCollectionsById } from 'modules/collection/selectors'
import { getItemId } from 'modules/location/selectors'
import { Collection } from 'modules/collection/types'
import { getLoading as getLoadingItemAction } from 'modules/item/selectors'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { calculateFinalSize } from './export'
import { Item, Rarity, CatalystItem } from './types'
import { getData as getItemsById, getItems, getEntityByItemId } from './selectors'
import { ItemTooBigError } from './errors'
import { hasOnChainDataChanged, getMetadata, isValidText, MAX_FILE_SIZE, getCatalystItemURN } from './utils'
import { fetchEntitiesRequest } from 'modules/entity/actions'
import { getMethodData } from 'modules/wallet/utils'
import { getCatalystContentUrl } from 'lib/api/peer'

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
  yield takeEvery(FETCH_COLLECTION_REQUEST, handleFetchCollectionRequest)
  yield takeEvery(SET_ITEMS_TOKEN_ID_FAILURE, handleRetrySetItemsTokenId)
  yield takeEvery(FETCH_RARITIES_REQUEST, handleFetchRaritiesRequest)
  yield takeEvery(RESCUE_ITEMS_REQUEST, handleRescueItemsRequest)
  yield takeEvery(RESET_ITEM_REQUEST, handleResetItemRequest)
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

  function* handleFetchCollectionRequest(action: FetchCollectionRequestAction) {
    const { id } = action.payload
    yield put(fetchCollectionItemsRequest(id))
  }

  function* fetchItemEntities() {
    while (true) {
      // TODO: once URN comes within Item remove all this in favor of yield take(FETCH_ITEMS_SUCCESS)
      // wait for at least 1 fetchItemsSuccess and 1 fetchCollectionsSuccess
      yield all([take(FETCH_ITEMS_SUCCESS), take(FETCH_COLLECTIONS_SUCCESS)])
      // wait for remaining itemItemRequests
      let loadingItemActions: ReturnType<typeof getLoadingItemAction> = yield select(getLoadingItemAction)
      while (loadingItemActions.some(action => action.type === FETCH_ITEMS_REQUEST)) {
        yield take(FETCH_ITEMS_SUCCESS)
        loadingItemActions = yield select(getLoadingItemAction)
      }
      const items: Item[] = yield select(getItems)
      const collectionsById: Record<string, Collection> = yield select(getCollectionsById)
      const urns = items
        .filter(item => item.isPublished)
        .map(item => getCatalystItemURN(collectionsById[item.collectionId!].contractAddress!, item.tokenId!))
      if (urns.length > 0) {
        yield put(fetchEntitiesRequest({ filters: { pointers: urns, onlyCurrentlyPointed: true } }))
      }
    }
  }

  function* handleRescueItemsRequest(action: RescueItemsRequestAction) {
    const { collection, items, contentHashes } = action.payload

    try {
      const chainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const tokenIds = items.map(item => item.tokenId!)
      const metadatas = items.map(item => getMetadata(item))

      const contract = getContract(ContractName.Committee, chainId)
      const { abi } = getContract(ContractName.ERC721CollectionV2, chainId)
      const implementation = new Contract(collection.contractAddress!, abi)

      const manager = getContract(ContractName.CollectionManager, chainId)
      const forwarder = getContract(ContractName.Forwarder, chainId)
      const data: string = yield call(getMethodData, implementation.populateTransaction.rescueItems(tokenIds, contentHashes, metadatas))

      const txHash: string = yield call(sendTransaction, contract, committee =>
        committee.manageCollection(manager.address, forwarder.address, collection.contractAddress!, [data])
      )

      const newItems = items.map<Item>((item, index) => ({ ...item, contentHash: contentHashes[index] }))
      yield put(rescueItemsSuccess(collection, newItems, contentHashes, chainId, txHash))
    } catch (error) {
      yield put(rescueItemsFailure(collection, items, contentHashes, error.message))
    }
  }

  function* handleResetItemRequest(action: ResetItemRequestAction) {
    const { itemId } = action.payload
    const itemsById: Record<string, Item> = yield select(getItemsById)
    const entitiesByItemId: Record<string, DeploymentWithMetadataContentAndPointers> = yield select(getEntityByItemId)

    const item = itemsById[itemId]
    const entity = entitiesByItemId[itemId]

    try {
      const catalystItem = entity.metadata as CatalystItem

      if (!entity.content) {
        throw new Error('Entity does not have content')
      }

      const catalystItemContentsTuple: [string, Blob][] = yield Promise.all(
        entity.content.map(async ({ key, hash }) => {
          const res = await fetch(getCatalystContentUrl(hash))
          return [key, await res.blob()]
        })
      )

      const catalystItemContents = catalystItemContentsTuple.reduce<Record<string, Blob>>((contents, [key, blob]) => {
        contents[key] = blob
        return contents
      }, {})

      const replaceItem: Item = {
        ...item,
        name: catalystItem.name,
        description: catalystItem.description,
        contents: entity.content.reduce<Record<string, string>>((contents, content) => {
          contents[content.key] = content.hash
          return contents
        }, {}),
        data: {
          ...item.data,
          category: catalystItem.data.category,
          hides: catalystItem.data.hides,
          replaces: catalystItem.data.replaces,
          tags: catalystItem.data.tags
        }
      }

      yield put(saveItemRequest(replaceItem, catalystItemContents))

      const saveItemResult: {
        success: SaveItemSuccessAction
        failure: SaveItemFailureAction
      } = yield race({
        success: take(SAVE_ITEM_SUCCESS),
        failure: take(SAVE_ITEM_FAILURE)
      })

      if (saveItemResult.success) {
        yield put(resetItemSuccess(itemId))
      } else if (saveItemResult.failure) {
        yield put(resetItemFailure(itemId, saveItemResult.failure.payload.error))
      }
    } catch (error) {
      yield put(resetItemFailure(itemId, error.message))
    }
  }
}
