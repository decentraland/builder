import { Contract } from 'ethers'
import { replace, push } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, delay, fork, all, race } from 'redux-saga/effects'
import { ChainId, Network } from '@dcl/schemas'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { Entity, EntityType } from 'dcl-catalyst-commons'
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
  SetPriceAndBeneficiaryRequestAction,
  setPriceAndBeneficiarySuccess,
  setPriceAndBeneficiaryFailure,
  SET_PRICE_AND_BENEFICIARY_REQUEST,
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
  SaveItemFailureAction,
  PUBLISH_THIRD_PARTY_ITEMS_REQUEST,
  PublishThirdPartyItemsRequestAction,
  publishThirdPartyItemsSuccess,
  publishThirdPartyItemsFailure,
  DOWNLOAD_ITEM_REQUEST,
  DownloadItemRequestAction,
  downloadItemFailure,
  downloadItemSuccess,
  rescueItemsChunkSuccess
} from './actions'
import { FetchCollectionRequestAction, FETCH_COLLECTIONS_SUCCESS, FETCH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { isLocked } from 'modules/collection/utils'
import { locations } from 'routing/locations'
import { BuilderAPI } from 'lib/api/builder'
import { getCollection, getCollections, getData as getCollectionsById } from 'modules/collection/selectors'
import { getItemId } from 'modules/location/selectors'
import { Collection } from 'modules/collection/types'
import { MAX_ITEMS } from 'modules/collection/constants'
import { getLoading as getLoadingItemAction } from 'modules/item/selectors'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { fetchEntitiesByPointersRequest } from 'modules/entity/actions'
import { getMethodData } from 'modules/wallet/utils'
import { getCatalystContentUrl } from 'lib/api/peer'
import { downloadZip } from 'lib/zip'
import { buildCatalystItemURN } from '../../lib/urn'
import { calculateFinalSize } from './export'
import { Item, Rarity, CatalystItem, BodyShapeType } from './types'
import { getData as getItemsById, getItems, getEntityByItemId, getCollectionItems } from './selectors'
import { ItemTooBigError } from './errors'
import { buildZipContents, getMetadata, groupsOf, isValidText, MAX_FILE_SIZE, toThirdPartyContractItems } from './utils'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'

export function* itemSaga(builder: BuilderAPI) {
  yield takeEvery(FETCH_ITEMS_REQUEST, handleFetchItemsRequest)
  yield takeEvery(FETCH_ITEM_REQUEST, handleFetchItemRequest)
  yield takeEvery(FETCH_COLLECTION_ITEMS_REQUEST, handleFetchCollectionItemsRequest)
  yield takeEvery(SAVE_ITEM_REQUEST, handleSaveItemRequest)
  yield takeEvery(SAVE_ITEM_SUCCESS, handleSaveItemSuccess)
  yield takeEvery(SET_PRICE_AND_BENEFICIARY_REQUEST, handleSetPriceAndBeneficiaryRequest)
  yield takeEvery(PUBLISH_THIRD_PARTY_ITEMS_REQUEST, handlePublishThirdPartyItemRequest)
  yield takeEvery(DELETE_ITEM_REQUEST, handleDeleteItemRequest)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(SET_COLLECTION, handleSetCollection)
  yield takeLatest(SET_ITEMS_TOKEN_ID_REQUEST, handleSetItemsTokenIdRequest)
  yield takeEvery(FETCH_COLLECTION_REQUEST, handleFetchCollectionRequest)
  yield takeEvery(SET_ITEMS_TOKEN_ID_FAILURE, handleRetrySetItemsTokenId)
  yield takeEvery(FETCH_RARITIES_REQUEST, handleFetchRaritiesRequest)
  yield takeEvery(RESCUE_ITEMS_REQUEST, handleRescueItemsRequest)
  yield takeEvery(RESET_ITEM_REQUEST, handleResetItemRequest)
  yield takeEvery(DOWNLOAD_ITEM_REQUEST, handleDownloadItemRequest)
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

      const collection: Collection | undefined = item.collectionId ? yield select(getCollection, item.collectionId!) : undefined

      if (collection && isLocked(collection)) {
        throw new Error(t('sagas.collection.collection_locked'))
      }

      if (Object.keys(contents).length > 0) {
        const finalSize: number = yield call(calculateFinalSize, item, contents)
        if (finalSize > MAX_FILE_SIZE) {
          throw new ItemTooBigError()
        }
      }

      yield call([builder, 'saveItem'], item, contents)

      yield put(saveItemSuccess(item, contents))
    } catch (error) {
      yield put(saveItemFailure(actionItem, contents, error.message))
    }
  }

  function* handleSaveItemSuccess() {
    yield put(closeModal('EditItemURNModal'))
  }

  function* handleSetPriceAndBeneficiaryRequest(action: SetPriceAndBeneficiaryRequestAction) {
    const { itemId, price, beneficiary } = action.payload
    try {
      const items: ReturnType<typeof getItems> = yield select(getItems)
      const item = items.find(item => item.id === itemId)
      const collections: ReturnType<typeof getCollections> = yield select(getCollections)
      const collection = collections.find(_collection => item && _collection.id === item.collectionId)

      if (!item || !collection) {
        throw new Error(yield call(t, 'sagas.item.not_found'))
      }

      if (!item.isPublished) {
        throw new Error(yield call(t, 'sagas.item.not_published'))
      }

      const newItem = { ...item, price, beneficiary, updatedAt: Date.now() }

      const metadata = getMetadata(newItem)
      const chainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const contract = { ...getContract(ContractName.ERC721CollectionV2, chainId), address: collection.contractAddress! }
      const txHash: string = yield call(sendTransaction, contract, collection =>
        collection.editItemsData([newItem.tokenId!], [newItem.price!], [newItem.beneficiary!], [metadata])
      )

      yield put(setPriceAndBeneficiarySuccess(newItem, chainId, txHash))
    } catch (error) {
      yield put(setPriceAndBeneficiaryFailure(itemId, price, beneficiary, error.message))
    }
  }

  function* handlePublishThirdPartyItemRequest(action: PublishThirdPartyItemsRequestAction) {
    const { thirdParty, items } = action.payload
    try {
      const collectionId = items[0].collectionId!
      const collection: Collection = yield select(getCollection, collectionId)

      const maticChainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const thirdPartyContract: ContractData = yield call(getContract, ContractName.ThirdPartyRegistry, maticChainId)
      const txHash: string = yield call(sendTransaction, thirdPartyContract, instantiatedThirdPartyContract =>
        instantiatedThirdPartyContract.addItems(thirdParty.id, toThirdPartyContractItems(items))
      )

      yield put(publishThirdPartyItemsSuccess(txHash, maticChainId, thirdParty, collection, items))
      yield put(push(locations.activity()))
    } catch (error) {
      yield put(publishThirdPartyItemsFailure(thirdParty, items, error.message))
    }
  }

  function* handleDeleteItemRequest(action: DeleteItemRequestAction) {
    const { item } = action.payload
    try {
      yield call(() => builder.deleteItem(item.id))
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
      const pointers = items
        .filter(item => item.isPublished)
        .map(item => buildCatalystItemURN(collectionsById[item.collectionId!].contractAddress!, item.tokenId!))
      if (pointers.length > 0) {
        yield put(fetchEntitiesByPointersRequest(EntityType.WEARABLE, pointers))
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

      const tokenIdsChunks = groupsOf(tokenIds, MAX_ITEMS)
      const itemsChunks = groupsOf(items, MAX_ITEMS)
      const metadatasChunks = groupsOf(metadatas, MAX_ITEMS)
      const contentHashesChunks = groupsOf(contentHashes, MAX_ITEMS)
      const txHashes: string[] = []

      for (let i = 0; i < tokenIdsChunks.length; i++) {
        const data: string = yield call(
          getMethodData,
          implementation.populateTransaction.rescueItems(tokenIdsChunks[i], contentHashesChunks[i], metadatasChunks[i])
        )

        const txHash: string = yield call(sendTransaction, contract, committee =>
          committee.manageCollection(manager.address, forwarder.address, collection.contractAddress!, [data])
        )

        txHashes.push(txHash)
        yield put(rescueItemsChunkSuccess(collection, itemsChunks[i], contentHashes, chainId, txHash))

        // Wait for transaction to finish
        while (true) {
          const action: FetchTransactionSuccessAction = yield take(FETCH_TRANSACTION_SUCCESS)
          if (action.payload.transaction.hash === txHash) {
            break
          }
        }
      }
      const newItems = items.map<Item>((item, index) => ({ ...item, contentHash: contentHashes[index] }))
      yield put(rescueItemsSuccess(collection, newItems, contentHashes, chainId, txHashes))
    } catch (error) {
      yield put(rescueItemsFailure(collection, items, contentHashes, error.message))
    }
  }

  function* handleDownloadItemRequest(action: DownloadItemRequestAction) {
    const { itemId } = action.payload

    try {
      // find item
      const items: ReturnType<typeof getItemsById> = yield select(getItemsById)
      const item = items[itemId]
      if (!item) {
        throw new Error(`Item not found for itemId="${itemId}"`)
      }

      // download blobs
      const files: Record<string, Blob> = yield call([builder, 'fetchContents'], item.contents)

      // check if both representations are equal
      const maleHashes: string[] = []
      const femaleHashes: string[] = []
      for (const path of Object.keys(item.contents)) {
        const hash = item.contents[path]
        if (path.startsWith(BodyShapeType.MALE)) {
          maleHashes.push(hash)
        } else if (path.startsWith(BodyShapeType.FEMALE)) {
          femaleHashes.push(hash)
        }
      }
      const areRepresentationsEqual = maleHashes.length === femaleHashes.length && maleHashes.every(hash => femaleHashes.includes(hash))

      // build zip files, if both representations are equal, the /male and /female directories can be merged
      const zip: Record<string, Blob> = yield call(buildZipContents, files, areRepresentationsEqual)

      // download zip
      const name = item.name.replace(/\s/g, '_')
      yield call(downloadZip, name, zip)

      // success 🎉
      yield put(downloadItemSuccess(itemId))
    } catch (error) {
      yield put(downloadItemFailure(itemId, error.message))
    }
  }
}

export function* handleResetItemRequest(action: ResetItemRequestAction) {
  const { itemId } = action.payload
  const itemsById: Record<string, Item> = yield select(getItemsById)
  const entitiesByItemId: Record<string, Entity> = yield select(getEntityByItemId)

  const item = itemsById[itemId]
  const entity = entitiesByItemId[itemId]

  try {
    const catalystItem = entity.metadata as CatalystItem

    if (!entity.content) {
      throw new Error('Entity does not have content')
    }

    const entityContentsAsMap = entity.content.reduce<Record<string, string>>((contents, { file, hash }) => {
      contents[file] = hash
      return contents
    }, {})

    // Fetch blobs from the catalyst so they can be reuploaded to the item
    const newContents: Record<string, Blob> = yield Promise.all(
      Object.entries(entityContentsAsMap).map<Promise<[string, Blob]>>(async ([key, hash]) => [
        key,
        await fetch(getCatalystContentUrl(hash)).then(res => res.blob())
      ])
    ).then(res =>
      res.reduce<Record<string, Blob>>((contents, [key, blob]) => {
        contents[key] = blob
        return contents
      }, {})
    )

    // Replace the current item with values from the item in the catalyst
    const newItem: Item = {
      ...item,
      name: catalystItem.name,
      description: catalystItem.description,
      contents: entityContentsAsMap,
      data: catalystItem.data
    }

    yield put(saveItemRequest(newItem, newContents))

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
