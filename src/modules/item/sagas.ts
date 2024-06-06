import PQueue from 'p-queue'
import { History } from 'history'
import { Contract, providers } from 'ethers'
import { LOCATION_CHANGE } from 'connected-react-router'
import { takeEvery, call, put, takeLatest, select, take, delay, fork, race, cancelled, getContext } from 'redux-saga/effects'
import { channel } from 'redux-saga'
import { ChainId, Network, Entity, EntityType, WearableCategory } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ModalState } from 'decentraland-dapps/dist/modules/modal/reducer'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { closeAllModals, closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { Toast } from 'decentraland-dapps/dist/modules/toast/types'
import { RENDER_TOAST, hideToast, showToast, RenderToastAction } from 'decentraland-dapps/dist/modules/toast/actions'
import { ToastType } from 'decentraland-ui'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import {
  BuilderClient,
  RemoteItem,
  MAX_THUMBNAIL_FILE_SIZE,
  MAX_WEARABLE_FILE_SIZE,
  MAX_SKIN_FILE_SIZE,
  MAX_EMOTE_FILE_SIZE
} from '@dcl/builder-client'
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
  rescueItemsChunkSuccess,
  FETCH_COLLECTION_ITEMS_SUCCESS,
  FetchItemsSuccessAction,
  FetchCollectionItemsSuccessAction,
  DELETE_ITEM_SUCCESS,
  DeleteItemSuccessAction,
  fetchCollectionItemsRequest,
  SAVE_MULTIPLE_ITEMS_SUCCESS,
  SaveMultipleItemsSuccessAction,
  SaveMultipleItemsCancelledAction,
  SAVE_MULTIPLE_ITEMS_CANCELLED,
  fetchItemsRequest,
  FETCH_COLLECTION_THUMBNAILS_REQUEST,
  fetchCollectionThumbnailsSuccess,
  fetchCollectionThumbnailsFailure,
  FetchCollectionThumbnailsRequestAction,
  SET_ITEM_COLLECTION,
  SetItemCollectionAction,
  FETCH_ORPHAN_ITEM_REQUEST,
  FetchOrphanItemRequestAction,
  fetchOrphanItemSuccess,
  fetchOrphanItemFailure
} from './actions'
import { fromRemoteItem } from 'lib/api/transformations'
import { isThirdParty } from 'lib/urn'
import { fetchItemCurationRequest } from 'modules/curations/itemCuration/actions'
import { updateProgressSaveMultipleItems } from 'modules/ui/createMultipleItems/action'
import { isLocked } from 'modules/collection/utils'
import { locations } from 'routing/locations'
import { BuilderAPI as LegacyBuilderAPI, FetchCollectionsParams } from 'lib/api/builder'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResource, PaginationStats } from 'lib/api/pagination'
import { getCollection, getCollections } from 'modules/collection/selectors'
import { getItemId } from 'modules/location/selectors'
import { FromParam } from 'modules/location/types'
import { Collection } from 'modules/collection/types'
import { MAX_ITEMS } from 'modules/collection/constants'
import { fetchEntitiesByPointersRequest } from 'modules/entity/actions'
import { takeLatestCancellable } from 'modules/common/utils'
import { waitForTx } from 'modules/transaction/utils'
import { getMethodData } from 'modules/wallet/utils'
import { setItems } from 'modules/editor/actions'
import { getCatalystContentUrl } from 'lib/api/peer'
import { downloadZip } from 'lib/zip'
import { isErrorWithCode } from 'lib/error'
import { calculateModelFinalSize, calculateFileSize, reHashOlderContents } from './export'
import {
  Item,
  BlockchainRarity,
  CatalystItem,
  BodyShapeType,
  IMAGE_PATH,
  THUMBNAIL_PATH,
  WearableData,
  ItemType,
  VIDEO_PATH
} from './types'
import { getData as getItemsById, getItems, getEntityByItemId, getCollectionItems, getItem, getPaginationData } from './selectors'
import {
  ItemEmoteTooBigError,
  ItemSkinTooBigError,
  ItemWearableTooBigError,
  ThumbnailFileTooBigError,
  VideoFileTooBigError
} from './errors'
import { buildZipContents, getMetadata, groupsOf, isValidText, generateCatalystImage, MAX_VIDEO_FILE_SIZE } from './utils'
import { ItemPaginationData } from './reducer'
import { getSuccessfulDeletedItemToast, getSuccessfulMoveItemToAnotherCollectionToast } from './toasts'

export const SAVE_AND_EDIT_FILES_BATCH_SIZE = 8

export function* itemSaga(legacyBuilder: LegacyBuilderAPI, builder: BuilderClient) {
  const createOrEditCancelledItemsChannel = channel()
  const createOrEditProgressChannel = channel()
  yield takeEvery(FETCH_ITEMS_REQUEST, handleFetchItemsRequest)
  yield takeEvery(FETCH_ITEM_REQUEST, handleFetchItemRequest)
  yield takeEvery(FETCH_ORPHAN_ITEM_REQUEST, handleFetchOrphanItemRequest)
  yield takeEvery(FETCH_COLLECTION_ITEMS_REQUEST, handleFetchCollectionItemsRequest)
  yield takeEvery(FETCH_COLLECTION_THUMBNAILS_REQUEST, handleFetchCollectionThumbnailsRequest)
  yield takeEvery(SAVE_ITEM_REQUEST, handleSaveItemRequest)
  yield takeEvery([SAVE_MULTIPLE_ITEMS_SUCCESS, SAVE_MULTIPLE_ITEMS_CANCELLED], handleSaveMultipleItemsSuccess)
  yield takeEvery(SAVE_ITEM_SUCCESS, handleSaveItemSuccess)
  yield takeEvery(SET_PRICE_AND_BENEFICIARY_REQUEST, handleSetPriceAndBeneficiaryRequest)
  yield takeEvery(DELETE_ITEM_REQUEST, handleDeleteItemRequest)
  yield takeEvery(DELETE_ITEM_SUCCESS, handleDeleteItemSuccess)
  yield takeLatest(SET_COLLECTION, handleSetCollection)
  yield takeLatest(SET_ITEM_COLLECTION, handleSetItemCollectionRequest)
  yield takeLatest(SET_ITEMS_TOKEN_ID_REQUEST, handleSetItemsTokenIdRequest)
  yield takeEvery(SET_ITEMS_TOKEN_ID_FAILURE, handleRetrySetItemsTokenId)
  yield takeEvery(FETCH_RARITIES_REQUEST, handleFetchRaritiesRequest)
  yield takeEvery(RESCUE_ITEMS_REQUEST, handleRescueItemsRequest)
  yield takeEvery(RESET_ITEM_REQUEST, handleResetItemRequest)
  yield takeEvery(DOWNLOAD_ITEM_REQUEST, handleDownloadItemRequest)
  yield takeEvery(createOrEditProgressChannel, handleCreateOrEditProgress)
  yield takeEvery(createOrEditCancelledItemsChannel, handleCreateOrEditCancelledItems)
  yield takeLatestCancellable(
    { initializer: SAVE_MULTIPLE_ITEMS_REQUEST, cancellable: CANCEL_SAVE_MULTIPLE_ITEMS },
    handleSaveMultipleItemsRequest
  )
  yield fork(fetchItemEntities)

  function* handleFetchRaritiesRequest() {
    try {
      const rarities: BlockchainRarity[] = yield call([legacyBuilder, 'fetchRarities'])
      yield put(fetchRaritiesSuccess(rarities))
    } catch (error) {
      yield put(fetchRaritiesFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleFetchItemsRequest(action: FetchItemsRequestAction) {
    const { address, params } = action.payload
    try {
      // fetch just the orphan items for the address
      const response: PaginatedResource<Item> = yield call([legacyBuilder, 'fetchItems'], address, { ...params, collectionId: 'null' })
      const { limit, page, pages, results, total } = response
      yield put(fetchItemsSuccess(results, { limit, page, pages, total }, address))
    } catch (error) {
      yield put(fetchItemsFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleFetchItemRequest(action: FetchItemRequestAction) {
    const { id } = action.payload
    try {
      const item: Item = yield call(() => legacyBuilder.fetchItem(id))
      yield put(fetchItemSuccess(id, item))
    } catch (error) {
      yield put(fetchItemFailure(id, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleFetchOrphanItemRequest(action: FetchOrphanItemRequestAction) {
    // TODO: Remove this method when there are no users with orphan items
    const { address } = action.payload
    try {
      // fetch just one orphan item for the address
      const response: PaginatedResource<Item> = yield call([legacyBuilder, 'fetchItems'], address, {
        page: 1,
        limit: 1,
        collectionId: 'null'
      })
      const { total } = response
      yield put(fetchOrphanItemSuccess(total > 0))
    } catch (error) {
      yield put(fetchOrphanItemFailure(isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* fetchCollectionItemsWithBatch(collectionId: string, pagesToFetch: number[], options: FetchCollectionsParams) {
    const REQUEST_BATCH_SIZE = 10
    const queue = new PQueue({ concurrency: REQUEST_BATCH_SIZE })
    const promisesOfPagesToFetch: (() => Promise<PaginatedResource<Item>>)[] = []
    pagesToFetch.forEach(page => {
      promisesOfPagesToFetch.push(
        () => legacyBuilder.fetchCollectionItems(collectionId, { page, ...options }) as Promise<PaginatedResource<Item>>
      )
    })
    const allItemPages: PaginatedResource<Item>[] = yield queue.addAll(promisesOfPagesToFetch)
    const { limit } = options
    const paginationStats =
      allItemPages[0].total !== undefined
        ? { limit, page: allItemPages[0].page, pages: allItemPages[0].pages, total: allItemPages[0].total }
        : undefined
    // When there is no limit, the result is not paginated so the response is different. The non-paginated ones will be deprecated
    const items = limit ? allItemPages.flatMap(result => result.results) : allItemPages.flat()
    return { items, paginationStats }
  }

  function* handleFetchCollectionItemsRequest(action: FetchCollectionItemsRequestAction) {
    const { collectionId, overridePaginationData, options } = action.payload
    const { page = DEFAULT_PAGE, ...restOfOptions } = options
    const isFetchingMultiplePages = Array.isArray(page)

    try {
      const { items, paginationStats }: { items: Item[]; paginationStats?: PaginationStats } = yield call(
        fetchCollectionItemsWithBatch,
        collectionId,
        isFetchingMultiplePages ? page : [page],
        restOfOptions
      )
      yield put(fetchCollectionItemsSuccess(collectionId, items, overridePaginationData ? paginationStats : undefined))
    } catch (error) {
      yield put(fetchCollectionItemsFailure(collectionId, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleFetchCollectionThumbnailsRequest(action: FetchCollectionThumbnailsRequestAction) {
    const { collectionId } = action.payload

    try {
      const { results }: { results: Item[] } = yield call([legacyBuilder, 'fetchCollectionItems'], collectionId, {
        page: 1,
        limit: 4
      })
      yield put(fetchCollectionThumbnailsSuccess(collectionId, results))
    } catch (error) {
      yield put(fetchCollectionThumbnailsFailure(collectionId, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleCreateOrEditProgress(action: { progress: number }) {
    yield put(updateProgressSaveMultipleItems(action.progress))
  }

  function* handleCreateOrEditCancelledItems(action: SaveMultipleItemsCancelledAction['payload']) {
    const { items, savedFileNames, notSavedFileNames, cancelledFileNames } = action
    yield put(saveMultipleItemsCancelled(items, savedFileNames, notSavedFileNames, cancelledFileNames))
  }

  function* handleSaveMultipleItemsRequest(action: SaveMultipleItemsRequestAction) {
    const { builtFiles } = action.payload
    const fileNamesSucceeded: string[] = []
    const fileNamesFailed: string[] = []
    const remoteItems: RemoteItem[] = []
    const queue = new PQueue({ concurrency: SAVE_AND_EDIT_FILES_BATCH_SIZE })
    try {
      const promisesOfItemsToSave: (() => Promise<void>)[] = []

      for (const builtFile of builtFiles) {
        promisesOfItemsToSave.push(async () => {
          try {
            const remoteItem: RemoteItem = await builder.upsertItem(builtFile.item, builtFile.newContent)
            fileNamesSucceeded.push(builtFile.fileName)
            remoteItems.push(remoteItem)
          } catch (error) {
            fileNamesFailed.push(builtFile.fileName)
          }
        })
      }

      queue.on('next', () => {
        // queue.size is the number of items in the queue and queue.pending the number of ongoing promises
        // the total pending files is the sum of the queue.size and queue.pending
        createOrEditProgressChannel.put({
          progress: Math.round(((builtFiles.length - (queue.size + queue.pending)) / builtFiles.length) * 100)
        })
      })

      yield queue.addAll(promisesOfItemsToSave)

      yield put(
        saveMultipleItemsSuccess(
          remoteItems.map(remoteItem => fromRemoteItem(remoteItem)),
          fileNamesSucceeded,
          fileNamesFailed
        )
      )
    } finally {
      const wasCancelled: boolean = yield cancelled()
      if (wasCancelled) {
        queue.clear()
        // using on idle to wait until the ongoing promises are finished
        queue.on('idle', () => {
          const cancelledFiles = builtFiles.filter(
            builtFile => !fileNamesSucceeded.includes(builtFile.fileName) && !fileNamesFailed.includes(builtFile.fileName)
          )
          createOrEditCancelledItemsChannel.put({
            items: remoteItems.map(remoteItem => fromRemoteItem(remoteItem)),
            savedFileNames: fileNamesSucceeded,
            notSavedFileNames: fileNamesFailed,
            cancelledFileNames: cancelledFiles.map(builtFile => builtFile.fileName)
          })
        })
      }
    }
  }

  function* handleSaveItemRequest(action: SaveItemRequestAction) {
    const { item: actionItem, contents: actionContents } = action.payload

    try {
      const item = { ...actionItem, updatedAt: Date.now() }
      const oldItem: Item | undefined = yield select(getItem, actionItem.id)
      const rarityChanged = oldItem && oldItem.rarity !== item.rarity
      const shouldValidateCategoryChanged =
        !!oldItem &&
        oldItem.type === ItemType.WEARABLE &&
        oldItem.data.category !== item.data.category &&
        oldItem.data.category === WearableCategory.SKIN

      if (!isValidText(item.name) || !isValidText(item.description)) {
        throw new Error(t('sagas.item.invalid_character'))
      }

      // Get all of the old content that is hashed with an older hashing mechanism
      const oldReHashedContentAndHashes: Record<string, { hash: string; content: Blob }> = yield call(
        reHashOlderContents,
        item.contents,
        legacyBuilder
      )
      const oldReHashedContent = Object.fromEntries(Object.entries(oldReHashedContentAndHashes).map(([key, value]) => [key, value.hash]))
      const oldReHashedContentWithNewHashes = Object.fromEntries(
        Object.entries(oldReHashedContentAndHashes).map(([key, value]) => [key, value.content])
      )

      // Re-write the contents so the files have the new hash
      item.contents = { ...item.contents, ...oldReHashedContent }

      // Add the old content to be uploaded again with the new hash
      const contents = { ...actionContents, ...oldReHashedContentWithNewHashes }

      const collection: Collection | undefined = item.collectionId ? yield select(getCollection, item.collectionId) : undefined

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

      if (Object.keys(contents).length > 0 || shouldValidateCategoryChanged) {
        // Extract the thumbnail from the contents to calculate the size using another limit
        const { [THUMBNAIL_PATH]: thumbnailContent, [VIDEO_PATH]: videoContent, ...modelContents } = contents
        const { [THUMBNAIL_PATH]: _thumbnailContent, [VIDEO_PATH]: _videoContent, ...itemContents } = item.contents
        // This will calculate the model's final size without the thumbnail with a limit of 2MB for wearables/emotes and 8MB for skins
        const finalModelSize: number = yield call(calculateModelFinalSize, itemContents, modelContents, legacyBuilder)
        let finalThumbnailSize = 0
        let finalVideoSize = 0

        // If a new thumbnail is present, this method will calculate only the thumbnail's final size with a limit of 1MB
        if (thumbnailContent) {
          finalThumbnailSize = yield call(calculateFileSize, thumbnailContent)
          if (finalThumbnailSize > MAX_THUMBNAIL_FILE_SIZE) {
            throw new ThumbnailFileTooBigError()
          }
        }

        // If a new video is present, this method will calculate only the video's final size with a limit of 1MB
        if (videoContent) {
          finalVideoSize = yield call(calculateFileSize, videoContent)
          if (finalVideoSize > MAX_VIDEO_FILE_SIZE) {
            throw new VideoFileTooBigError()
          }
        }

        const isEmote = item.type === ItemType.EMOTE
        const isSkin = !isEmote && item.data.category === WearableCategory.SKIN

        if (isEmote && finalModelSize > MAX_EMOTE_FILE_SIZE) {
          throw new ItemEmoteTooBigError()
        }

        if (isSkin && finalModelSize > MAX_SKIN_FILE_SIZE) {
          throw new ItemSkinTooBigError()
        }

        if (!isSkin && !isEmote && finalModelSize > MAX_WEARABLE_FILE_SIZE) {
          throw new ItemWearableTooBigError()
        }
      }

      yield call([legacyBuilder, 'saveItem'], item, contents)
      yield put(saveItemSuccess(item, contents))
    } catch (error) {
      yield put(saveItemFailure(actionItem, actionContents, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* fetchNewCollectionItemsPaginated(collectionId: string, newItemsAmount = 1) {
    const history: History = yield getContext('history')
    const paginationData: ItemPaginationData = yield select(getPaginationData, collectionId)
    const { currentPage, limit, total } = paginationData || {}
    const newItemPage = Math.ceil((total + newItemsAmount) / limit) // optimistic computation, in case the save is successful
    if (newItemPage !== currentPage) {
      history.push(locations.thirdPartyCollectionDetail(collectionId, { page: newItemPage }))
    } else {
      yield put(fetchCollectionItemsRequest(collectionId, { page: currentPage, limit }))
    }
  }

  function* handleSaveMultipleItemsSuccess(action: SaveMultipleItemsSuccessAction) {
    const history: History = yield getContext('history')
    const { items } = action.payload
    const collectionId = items.length > 0 ? items[0].collectionId : null

    if (collectionId && history.location.pathname === locations.thirdPartyCollectionDetail(collectionId)) {
      yield call(fetchNewCollectionItemsPaginated, collectionId, items.length)
    }
  }

  function* handleSaveItemSuccess(action: SaveItemSuccessAction) {
    const history: History = yield getContext('history')
    const location = history.location
    const address: string = yield select(getAddress)
    const openModals: ModalState = yield select(getOpenModals)
    const { item } = action.payload
    const collectionId = item.collectionId!
    const ItemModals = ['EditItemURNModal', 'EditPriceAndBeneficiaryModal', 'AddExistingItemModal']
    if (ItemModals.some(modal => openModals[modal])) {
      yield put(closeAllModals())
    } else if (openModals['CreateSingleItemModal']) {
      if (location.pathname === locations.collectionDetail(collectionId) && item.type === ItemType.EMOTE) {
        // Redirect to the item editor
        yield put(setItems([item]))
        history.push(locations.itemEditor({ collectionId, itemId: item.id, newItem: item.name }), { fromParam: FromParam.COLLECTIONS })
      } else {
        // When creating a Wearable/Emote in the itemEditor, reload the left panel to show the new item created
        if (location.pathname === locations.itemEditor()) {
          yield put(setItems([item]))
          if (collectionId) {
            const paginationData: ItemPaginationData | undefined = yield select(getPaginationData, collectionId)
            yield put(
              fetchCollectionItemsRequest(
                collectionId,
                paginationData
                  ? { page: paginationData.currentPage, limit: paginationData.limit }
                  : { page: DEFAULT_PAGE, limit: DEFAULT_PAGE_SIZE }
              )
            )
          } else {
            const paginationData: ItemPaginationData | undefined = yield select(getPaginationData, address)
            yield put(
              fetchItemsRequest(
                address,
                paginationData
                  ? { page: paginationData.currentPage, limit: paginationData.limit }
                  : { page: DEFAULT_PAGE, limit: DEFAULT_PAGE_SIZE }
              )
            )
          }
        }
        yield put(closeModal('CreateSingleItemModal'))
      }
    }
    // Fetch the collection items again, we don't know where the item is going to be in the pagination data
    if (location.pathname === locations.thirdPartyCollectionDetail(collectionId)) {
      yield call(fetchNewCollectionItemsPaginated, collectionId)
    }
    if (isThirdParty(item.urn) && item.isPublished) {
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

      const chainId: ChainId = yield call(getChainIdByNetwork, Network.MATIC)
      const contract = { ...getContract(ContractName.ERC721CollectionV2, chainId), address: collection.contractAddress! }
      // Get the item metadata from the blockchain to avoid modifications when updating the price or the beneficiary.
      const provider: Awaited<ReturnType<typeof getNetworkProvider>> = yield call(getNetworkProvider, chainId)
      const implementation = new Contract(contract.address, contract.abi, new providers.Web3Provider(provider))
      const { metadata } = yield call(implementation.items, item.tokenId)
      const txHash: string = yield call(sendTransaction, contract, collection =>
        collection.editItemsData([newItem.tokenId!], [newItem.price], [newItem.beneficiary], [metadata])
      )

      yield put(setPriceAndBeneficiarySuccess(newItem, chainId, txHash))
    } catch (error) {
      yield put(setPriceAndBeneficiaryFailure(itemId, price, beneficiary, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleDeleteItemRequest(action: DeleteItemRequestAction) {
    const { item } = action.payload
    const history: History = yield getContext('history')
    try {
      yield call(() => legacyBuilder.deleteItem(item.id))
      yield put(deleteItemSuccess(item))
      const itemIdInUriParam: string = yield select(getItemId)
      if (itemIdInUriParam === item.id) {
        history.replace(locations.collections())
      }
      yield put(closeModal('DeleteItemModal'))
      yield put(showToast(getSuccessfulDeletedItemToast(item), 'bottom center'))
    } catch (error) {
      yield put(deleteItemFailure(item, isErrorWithMessage(error) ? error.message : 'Unknown error'))
    }
  }

  function* handleDeleteItemSuccess(action: DeleteItemSuccessAction) {
    const { item } = action.payload
    const history: History = yield getContext('history')
    const collectionId = item.collectionId!
    const location = history.location
    const isTPCollectionPage = location.pathname === locations.thirdPartyCollectionDetail(collectionId)
    const isCollectionsPage = location.pathname === locations.collections()
    if (isTPCollectionPage || isCollectionsPage) {
      const address: string = yield select(getAddress)
      const paginationIndex = isTPCollectionPage ? collectionId : address
      const paginationData: ItemPaginationData = yield select(getPaginationData, paginationIndex)
      const { currentPage, limit, ids } = paginationData
      const shouldGoToPreviousPage = currentPage > 1 && ids.length === 1 && ids[0] === item.id
      if (isTPCollectionPage && shouldGoToPreviousPage) {
        history.push(locations.thirdPartyCollectionDetail(collectionId, { page: currentPage - 1 }))
      } else {
        const fetchFn = isTPCollectionPage ? fetchCollectionItemsRequest : fetchItemsRequest
        yield put(fetchFn(paginationIndex, { page: currentPage, limit }))
      }
    }
  }

  function* handleSetCollection(action: SetCollectionAction) {
    const { item, collectionId } = action.payload
    const newItem = { ...item }
    const address: string = yield select(getAddress)
    if (collectionId === null) {
      delete newItem.collectionId
    } else {
      newItem.collectionId = collectionId
    }
    yield put(saveItemRequest(newItem, {}))
    yield take(SAVE_ITEM_SUCCESS)
    yield put(closeModal('MoveItemToCollectionModal'))
    yield put(fetchItemsRequest(address))
  }

  function* handleSetItemCollectionRequest(action: SetItemCollectionAction) {
    const { item, collectionId } = action.payload
    const newItem = { ...item, collectionId: collectionId }
    const address: string = yield select(getAddress)
    const collection: Collection = yield select(getCollection, collectionId)
    yield put(saveItemRequest(newItem, {}))
    yield take(SAVE_ITEM_SUCCESS)
    yield put(closeModal('MoveItemToAnotherCollectionModal'))
    const toast: Omit<Toast, 'id'> = yield call(getSuccessfulMoveItemToAnotherCollectionToast, item, collection)
    yield put(showToast(toast, 'bottom center'))
    // Get the created toast id to close if the user clicks on the redirect link or changes the page
    const {
      payload: { id: toastId }
    }: RenderToastAction = yield take(RENDER_TOAST)
    yield put(fetchItemsRequest(address))
    const location: Location = yield take(LOCATION_CHANGE)
    if (location.pathname !== locations.collectionDetail(item.collectionId)) {
      yield put(hideToast(toastId))
    }
  }

  function* handleSetItemsTokenIdRequest(action: SetItemsTokenIdRequestAction) {
    const { collection, items } = action.payload

    try {
      const { items: newItems }: { items: Item[] } = yield call([legacyBuilder, 'publishStandardCollection'], collection.id)
      yield put(setItemsTokenIdSuccess(newItems))
    } catch (error) {
      // Parse error.code to int because axiosError.code is string
      yield put(
        setItemsTokenIdFailure(
          collection,
          items,
          isErrorWithMessage(error) ? error.message : 'Unknown error',
          parseInt(isErrorWithCode(error) ? error.code.toString() : '0')
        )
      )
    }
  }

  function* handleRetrySetItemsTokenId(action: SetItemsTokenIdFailureAction) {
    const { collection, error, errorCode } = action.payload

    if (errorCode === 401) {
      yield delay(5000) // wait five seconds

      // Refresh data from state
      const newCollection: Collection = yield select(getCollection, collection.id)
      const newItems: Item[] = yield select(getCollectionItems, collection.id)
      yield put(setItemsTokenIdRequest(newCollection, newItems))
    } else {
      yield put(
        showToast({
          type: ToastType.ERROR,
          title: t('publish_wizard_collection_modal.publish_failed'),
          body: error,
          timeout: 6000,
          closable: true
        })
      )
    }
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
      yield put(rescueItemsFailure(collection, items, contentHashes, isErrorWithMessage(error) ? error.message : 'Unknown error'))
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
      yield put(downloadItemFailure(itemId, isErrorWithMessage(error) ? error.message : 'Unknown error'))
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
    yield put(resetItemFailure(itemId, isErrorWithMessage(error) ? error.message : 'Unknown error'))
  }
}
