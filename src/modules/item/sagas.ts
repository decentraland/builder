import PQueue from 'p-queue'
import { Contract } from 'ethers'
import { getLocation, push, replace } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, delay, fork, race, cancelled } from 'redux-saga/effects'
import { channel } from 'redux-saga'
import { ChainId, Network } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ModalState } from 'decentraland-dapps/dist/modules/modal/reducer'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { BuilderClient, RemoteItem } from '@dcl/builder-client'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import {
  FetchItemsRequestAction,
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
  DOWNLOAD_ITEM_REQUEST,
  DownloadItemRequestAction,
  downloadItemFailure,
  downloadItemSuccess,
  SaveMultipleItemsRequestAction,
  SAVE_MULTIPLE_ITEMS_REQUEST,
  saveMultipleItemsSuccess,
  CANCEL_SAVE_MULTIPLE_ITEMS,
  saveMultipleItemsCancelled,
  // saveMultipleItemsFailure,
  rescueItemsChunkSuccess,
  FETCH_COLLECTION_ITEMS_SUCCESS,
  FetchItemsSuccessAction,
  FetchCollectionItemsSuccessAction,
  fetchItemsRequest,
  DELETE_ITEM_SUCCESS,
  DeleteItemSuccessAction,
  fetchCollectionItemsRequest,
  SAVE_MULTIPLE_ITEMS_SUCCESS,
  SaveMultipleItemsSuccessAction
} from './actions'
import { fromRemoteItem } from 'lib/api/transformations'
import { isThirdParty } from 'lib/urn'
import { fetchItemCurationRequest } from 'modules/curations/itemCuration/actions'
import { updateProgressSaveMultipleItems } from 'modules/ui/createMultipleItems/action'
import { isLocked } from 'modules/collection/utils'
import { locations } from 'routing/locations'
import { BuilderAPI as LegacyBuilderAPI } from 'lib/api/builder'
import { DEFAULT_PAGE, PaginatedResource, PaginationStats } from 'lib/api/pagination'
import { getCollection, getCollections } from 'modules/collection/selectors'
import { getItemId } from 'modules/location/selectors'
import { CurationStatus } from 'modules/curations/types'
import { Collection } from 'modules/collection/types'
import { MAX_ITEMS } from 'modules/collection/constants'
import { fetchEntitiesByPointersRequest } from 'modules/entity/actions'
import { takeLatestCancellable } from 'modules/common/utils'
import { waitForTx } from 'modules/transaction/utils'
import { getMethodData } from 'modules/wallet/utils'
import { getCatalystContentUrl } from 'lib/api/peer'
import { downloadZip } from 'lib/zip'
import { calculateFinalSize } from './export'
import { Item, Rarity, CatalystItem, BodyShapeType, IMAGE_PATH, THUMBNAIL_PATH, WearableData } from './types'
import { getData as getItemsById, getItems, getEntityByItemId, getCollectionItems, getItem, getPaginationData } from './selectors'
import { ItemTooBigError } from './errors'
import { buildZipContents, getMetadata, groupsOf, isValidText, generateCatalystImage, MAX_FILE_SIZE } from './utils'
import { LoginSuccessAction, LOGIN_SUCCESS } from 'modules/identity/actions'
import { ItemPaginationData } from './reducer'

export function* itemSaga(legacyBuilder: LegacyBuilderAPI, builder: BuilderClient) {
  const createOrEditProgressChannel = channel()
  yield takeEvery(FETCH_ITEMS_REQUEST, handleFetchItemsRequest)
  yield takeEvery(FETCH_ITEM_REQUEST, handleFetchItemRequest)
  yield takeEvery(FETCH_COLLECTION_ITEMS_REQUEST, handleFetchCollectionItemsRequest)
  yield takeEvery(SAVE_ITEM_REQUEST, handleSaveItemRequest)
  yield takeEvery(SAVE_MULTIPLE_ITEMS_SUCCESS, handleSaveMultipleItemsSuccess)
  yield takeEvery(SAVE_ITEM_SUCCESS, handleSaveItemSuccess)
  yield takeEvery(SET_PRICE_AND_BENEFICIARY_REQUEST, handleSetPriceAndBeneficiaryRequest)
  yield takeEvery(DELETE_ITEM_REQUEST, handleDeleteItemRequest)
  yield takeEvery(DELETE_ITEM_SUCCESS, handleDeleteItemSuccess)
  yield takeLatest(LOGIN_SUCCESS, handleLoginSuccess)
  yield takeLatest(SET_COLLECTION, handleSetCollection)
  yield takeLatest(SET_ITEMS_TOKEN_ID_REQUEST, handleSetItemsTokenIdRequest)
  yield takeEvery(SET_ITEMS_TOKEN_ID_FAILURE, handleRetrySetItemsTokenId)
  yield takeEvery(FETCH_RARITIES_REQUEST, handleFetchRaritiesRequest)
  yield takeEvery(RESCUE_ITEMS_REQUEST, handleRescueItemsRequest)
  yield takeEvery(RESET_ITEM_REQUEST, handleResetItemRequest)
  yield takeEvery(DOWNLOAD_ITEM_REQUEST, handleDownloadItemRequest)
  yield takeEvery(createOrEditProgressChannel, handleCreateOrEditProgress)
  yield takeLatestCancellable(
    { initializer: SAVE_MULTIPLE_ITEMS_REQUEST, cancellable: CANCEL_SAVE_MULTIPLE_ITEMS },
    handleSaveMultipleItemsRequest
  )
  yield fork(fetchItemEntities)

  function* handleFetchRaritiesRequest() {
    try {
      const rarities: Rarity[] = yield call([legacyBuilder, 'fetchRarities'])
      yield put(fetchRaritiesSuccess(rarities))
    } catch (error) {
      yield put(fetchRaritiesFailure(error.message))
    }
  }

  function* handleFetchItemsRequest(action: FetchItemsRequestAction) {
    const { address } = action.payload
    try {
      // fetch just the orphan items for the address
      const response: PaginatedResource<Item> = yield call([legacyBuilder, 'fetchItems'], address, { collectionId: 'null' })
      const { limit, page, pages, results, total } = response
      yield put(fetchItemsSuccess(results, { limit, page, pages, total }, address))
    } catch (error) {
      yield put(fetchItemsFailure(error.message))
    }
  }

  function* handleFetchItemRequest(action: FetchItemRequestAction) {
    const { id } = action.payload
    try {
      const item: Item = yield call(() => legacyBuilder.fetchItem(id))
      yield put(fetchItemSuccess(id, item))
    } catch (error) {
      yield put(fetchItemFailure(id, error.message))
    }
  }

  function* fetchCollectionItemsWithBatch(collectionId: string, pagesToFetch: number[], limit?: number, status?: CurationStatus) {
    const REQUEST_BATCH_SIZE = 10
    const queue = new PQueue({ concurrency: REQUEST_BATCH_SIZE })
    const promisesOfPagesToFetch: (() => Promise<PaginatedResource<Item>>)[] = []
    pagesToFetch.forEach(page => {
      promisesOfPagesToFetch.push(() => legacyBuilder.fetchCollectionItems(collectionId, { page, limit, status }))
    })
    const allItemPages: PaginatedResource<Item>[] = yield queue.addAll(promisesOfPagesToFetch)
    const paginationStats = allItemPages[0].total
      ? { limit, page: allItemPages[0].page, pages: allItemPages[0].pages, total: allItemPages[0].total }
      : {}
    // When there is no limit, the result is not paginated so the response is different. The non-paginated ones will be deprecated
    const items = limit ? allItemPages.flatMap(result => result.results) : allItemPages.flat()
    return { items, paginationStats }
  }

  function* handleFetchCollectionItemsRequest(action: FetchCollectionItemsRequestAction) {
    const { collectionId, page = DEFAULT_PAGE, limit, overridePaginationData, status } = action.payload
    const isFetchingMultiplePages = Array.isArray(page)

    try {
      const { items, paginationStats }: { items: Item[]; paginationStats: PaginationStats } = yield call(
        fetchCollectionItemsWithBatch,
        collectionId,
        isFetchingMultiplePages ? page : [page],
        limit,
        status
      )
      yield put(fetchCollectionItemsSuccess(collectionId, items, overridePaginationData ? paginationStats : undefined))
    } catch (error) {
      yield put(fetchCollectionItemsFailure(collectionId, error.message))
    }
  }

  function* handleCreateOrEditProgress(action: { progress: number }) {
    yield put(updateProgressSaveMultipleItems(action.progress))
  }

  function* handleSaveMultipleItemsRequest(action: SaveMultipleItemsRequestAction) {
    const { builtFiles } = action.payload
    const fileNamesSucceeded: string[] = []
    const fileNamesFailed: string[] = []
    const REQUEST_BATCH_SIZE = 8
    const queue = new PQueue({ concurrency: REQUEST_BATCH_SIZE })
    const promisesOfItemsToSave: (() => Promise<RemoteItem | undefined>)[] = []

    for (const [_index, builtFile] of builtFiles.entries()) {
      promisesOfItemsToSave.push(async () => {
        try {
          const remoteItem: RemoteItem = await builder.upsertItem(builtFile.item, builtFile.newContent)
          fileNamesSucceeded.push(builtFile.fileName)
          return remoteItem
        } catch (error) {
          fileNamesFailed.push(builtFile.fileName)
          return undefined
        }
      })
    }

    queue.on('next', () => {
      createOrEditProgressChannel.put({ progress: Math.round(((builtFiles.length - queue.size) / builtFiles.length) * 100) })
    })

    const remoteResponses: RemoteItem[] = yield queue.addAll(promisesOfItemsToSave)
    const remoteItems: RemoteItem[] = remoteResponses.filter(Boolean)

    yield put(
      saveMultipleItemsSuccess(
        remoteItems.map(remoteItem => fromRemoteItem(remoteItem)),
        fileNamesSucceeded,
        fileNamesFailed
      )
    )

    const wasCancelled: boolean = yield cancelled()
    if (wasCancelled) {
      yield put(
        saveMultipleItemsCancelled(
          remoteItems.map(remoteItem => fromRemoteItem(remoteItem)),
          fileNamesSucceeded,
          fileNamesFailed
        )
      )
    }
  }

  function* handleSaveItemRequest(action: SaveItemRequestAction) {
    const { item: actionItem, contents } = action.payload
    try {
      const item = { ...actionItem, updatedAt: Date.now() }
      const oldItem: Item | undefined = yield select(getItem, actionItem.id)
      const rarityChanged = oldItem && oldItem.rarity !== item.rarity

      if (!isValidText(item.name) || !isValidText(item.description)) {
        throw new Error(t('sagas.item.invalid_character'))
      }

      const collection: Collection | undefined = item.collectionId ? yield select(getCollection, item.collectionId!) : undefined

      if (collection && isLocked(collection)) {
        throw new Error(t('sagas.collection.collection_locked'))
      }

      // If there's a new thumbnail image or the item doesn't have a catalyst image, create it and add it to the item
      if (contents[THUMBNAIL_PATH] || !item.contents[IMAGE_PATH] || rarityChanged) {
        const catalystImage: { content: Blob; hash: string } = yield call(generateCatalystImage, item, {
          thumbnail: contents[THUMBNAIL_PATH]
        })
        contents[IMAGE_PATH] = catalystImage.content
        item.contents[IMAGE_PATH] = catalystImage.hash
      }

      if (Object.keys(contents).length > 0) {
        const finalSize: number = yield call(calculateFinalSize, item, contents)
        if (finalSize > MAX_FILE_SIZE) {
          throw new ItemTooBigError()
        }
      }

      yield call([legacyBuilder, 'saveItem'], item, contents)

      yield put(saveItemSuccess(item, contents))
    } catch (error) {
      yield put(saveItemFailure(actionItem, contents, error.message))
    }
  }

  function* fetchNewCollectionItemsPaginated(collectionId: string, newItemsAmount = 1) {
    const paginationData: ItemPaginationData = yield select(getPaginationData, collectionId)
    const { currentPage, limit, total } = paginationData
    const newItemPage = Math.ceil((total + newItemsAmount) / limit) // optimistic computation, in case the save is successful
    if (newItemPage !== currentPage) {
      yield put(push(locations.thirdPartyCollectionDetail(collectionId, { page: newItemPage })))
    } else {
      yield put(fetchCollectionItemsRequest(collectionId, { page: currentPage, limit }))
    }
  }

  function* handleSaveMultipleItemsSuccess(action: SaveMultipleItemsSuccessAction) {
    const { items } = action.payload
    const collectionId = items[0].collectionId!
    const location: ReturnType<typeof getLocation> = yield select(getLocation)
    if (location.pathname === locations.thirdPartyCollectionDetail(collectionId)) {
      yield call(fetchNewCollectionItemsPaginated, collectionId, items.length)
    }
  }

  function* handleSaveItemSuccess(action: SaveItemSuccessAction) {
    const openModals: ModalState = yield select(getOpenModals)
    if (openModals['EditItemURNModal']) {
      yield put(closeModal('EditItemURNModal'))
    }
    const { item } = action.payload
    const collectionId = item.collectionId!
    const location: ReturnType<typeof getLocation> = yield select(getLocation)
    // Fetch the the collection items again, we don't know where the item is going to be in the pagination data
    if (location.pathname === locations.thirdPartyCollectionDetail(collectionId)) {
      yield call(fetchNewCollectionItemsPaginated, collectionId)
    }
    if (isThirdParty(item.urn)) {
      yield put(fetchItemCurationRequest(item.collectionId!, item.id))
    }
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

  function* handleDeleteItemRequest(action: DeleteItemRequestAction) {
    const { item } = action.payload
    try {
      yield call(() => legacyBuilder.deleteItem(item.id))
      yield put(deleteItemSuccess(item))
      const itemIdInUriParam: string = yield select(getItemId)
      if (itemIdInUriParam === item.id) {
        yield put(replace(locations.collections()))
      }
    } catch (error) {
      yield put(deleteItemFailure(item, error.message))
    }
  }

  function* handleDeleteItemSuccess(action: DeleteItemSuccessAction) {
    const { item } = action.payload
    const collectionId = item.collectionId!
    const location: ReturnType<typeof getLocation> = yield select(getLocation)
    if (location.pathname === locations.thirdPartyCollectionDetail(collectionId)) {
      const paginationData: ItemPaginationData = yield select(getPaginationData, collectionId)
      const { currentPage, limit, ids } = paginationData
      const shouldGoToPreviousPage = currentPage > 1 && ids.length === 1 && ids[0] === item.id
      if (shouldGoToPreviousPage) {
        yield put(push(locations.thirdPartyCollectionDetail(collectionId, { page: currentPage - 1 })))
      } else {
        yield put(fetchCollectionItemsRequest(collectionId, { page: currentPage, limit }))
      }
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
      const { items: newItems }: { items: Item[] } = yield call(() => legacyBuilder.publishStandardCollection(collection.id))
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

  function* fetchItemEntities() {
    while (true) {
      const result: FetchItemsSuccessAction | FetchCollectionItemsSuccessAction = yield take([
        FETCH_ITEMS_SUCCESS,
        FETCH_COLLECTION_ITEMS_SUCCESS
      ])

      const { items } = result.payload
      const pointers = items.filter(item => item.isPublished).map(item => item.urn!)

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
        yield put(rescueItemsChunkSuccess(collection, itemsChunks[i], contentHashesChunks[i], chainId, txHash))

        yield call(waitForTx, txHash)
      }
      const newItems = items.map<Item>((item, index) => ({ ...item, blockchainContentHash: contentHashes[index] }))
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
      const files: Record<string, Blob> = yield call([legacyBuilder, 'fetchContents'], item.contents)

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
      data: catalystItem.data as WearableData
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
