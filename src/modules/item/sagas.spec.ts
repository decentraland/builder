import uuidv4 from 'uuid/v4'
import { getLocation, push } from 'connected-react-router'
import { locations } from 'routing/locations'
import { expectSaga, SagaType } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { ethers } from 'ethers'
import { Entity, EntityType } from '@dcl/schemas'
import { call, select, take, race, delay } from 'redux-saga/effects'
import { BuilderClient, RemoteItem } from '@dcl/builder-client'
import { ChainId, Network, BodyShape, WearableCategory } from '@dcl/schemas'
import { ToastProps, ToastType } from 'decentraland-ui'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { FETCH_TRANSACTION_FAILURE, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { SHOW_TOAST } from 'decentraland-dapps/dist/modules/toast/actions'
import { Collection } from 'modules/collection/types'
import { MAX_ITEMS } from 'modules/collection/constants'
import { FromParam } from 'modules/location/types'
import { getMethodData } from 'modules/wallet/utils'
import { mockedItem, mockedItemContents, mockedLocalItem, mockedRemoteItem } from 'specs/item'
import { getCollections, getCollection } from 'modules/collection/selectors'
import { updateProgressSaveMultipleItems } from 'modules/ui/createMultipleItems/action'
import { fetchItemCurationRequest } from 'modules/curations/itemCuration/actions'
import { downloadZip } from 'lib/zip'
import { BuilderAPI } from 'lib/api/builder'
import { PaginatedResource } from 'lib/api/pagination'
import {
  resetItemFailure,
  resetItemRequest,
  resetItemSuccess,
  saveItemFailure,
  saveItemRequest,
  saveItemSuccess,
  setPriceAndBeneficiaryRequest,
  setPriceAndBeneficiarySuccess,
  SAVE_ITEM_FAILURE,
  SAVE_ITEM_SUCCESS,
  setPriceAndBeneficiaryFailure,
  downloadItemFailure,
  downloadItemRequest,
  downloadItemSuccess,
  saveMultipleItemsRequest,
  saveMultipleItemsSuccess,
  saveMultipleItemsCancelled,
  cancelSaveMultipleItems,
  rescueItemsRequest,
  rescueItemsChunkSuccess,
  rescueItemsSuccess,
  rescueItemsFailure,
  fetchCollectionItemsRequest,
  fetchCollectionItemsSuccess,
  fetchCollectionItemsFailure,
  deleteItemSuccess,
  fetchItemsRequest,
  fetchItemsSuccess,
  fetchRaritiesRequest,
  fetchRaritiesSuccess,
  fetchRaritiesFailure,
  setCollection,
  setItemsTokenIdFailure,
  setItemsTokenIdRequest,
  setItemCollection,
  fetchOrphanItemRequest,
  fetchOrphanItemSuccess,
  fetchOrphanItemFailure
} from './actions'
import { itemSaga, handleResetItemRequest, SAVE_AND_EDIT_FILES_BATCH_SIZE } from './sagas'
import {
  BuiltFile,
  Currency,
  IMAGE_PATH,
  Item,
  ItemRarity,
  ItemType,
  Rarity,
  THUMBNAIL_PATH,
  VIDEO_PATH,
  WearableRepresentation
} from './types'
import { calculateModelFinalSize, calculateFileSize, reHashOlderContents } from './export'
import { buildZipContents, generateCatalystImage, groupsOf, MAX_FILE_SIZE, MAX_THUMBNAIL_FILE_SIZE, MAX_VIDEO_FILE_SIZE } from './utils'
import { getCollectionItems, getData as getItemsById, getEntityByItemId, getItem, getItems, getPaginationData } from './selectors'
import { ItemPaginationData } from './reducer'
import * as toasts from './toasts'

const blob: Blob = new Blob()
let contents: Record<string, Blob>

const builderAPI = {
  saveItem: jest.fn(),
  saveItemContents: jest.fn(),
  fetchContents: jest.fn(),
  fetchCollectionItems: jest.fn(),
  fetchRarities: jest.fn(),
  fetchItems: jest.fn()
} as unknown as BuilderAPI

let builderClient: BuilderClient

let dateNowSpy: jest.SpyInstance
const updatedAt = Date.now()
const mockAddress = '0x6D7227d6F36FC997D53B4646132b3B55D751cc7c'

beforeEach(() => {
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => updatedAt)
  builderClient = {
    upsertItem: jest.fn(),
    getContentSize: jest.fn()
  } as unknown as BuilderClient
  contents = { path: blob }
})

afterEach(() => {
  dateNowSpy.mockRestore()
})

describe('when handling the save item request action', () => {
  let item: Item

  beforeEach(() => {
    item = { ...mockedItem }
  })

  describe('and the name contains ":"', () => {
    beforeEach(() => {
      item.name = 'invalid:name'
    })

    it('should put a saveItemFailure action with invalid character message', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([[select(getItem, item.id), undefined]])
        .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the description contains ":"', () => {
    beforeEach(() => {
      item.name = 'valid name'
      item.description = 'invalid:description'
    })

    it('should put a saveItemFailure action with invalid character message', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([[select(getItem, item.id), undefined]])
        .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('and file size is larger than 3 MB', () => {
    beforeEach(() => {
      item.name = 'valid name'
      item.description = 'valid description'
      item.updatedAt = updatedAt
    })

    it('should put a saveItemFailure action with item too big message', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItem, item.id), undefined],
          [matchers.call.fn(reHashOlderContents), {}],
          [matchers.call.fn(generateCatalystImage), Promise.resolve({ hash: 'someHash', content: blob })],
          [matchers.call.fn(calculateModelFinalSize), Promise.resolve(MAX_FILE_SIZE + MAX_THUMBNAIL_FILE_SIZE + 1)],
          [matchers.call.fn(calculateFileSize), MAX_THUMBNAIL_FILE_SIZE]
        ])
        .put(saveItemFailure(item, contents, 'The entire item is too big to be uploaded. The max size for all files is 3MB.'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('and thumbnail file size is larger than 1MB', () => {
    it('should put a saveItemFailure action with thumbnail too big message', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItem, item.id), undefined],
          [matchers.call.fn(reHashOlderContents), {}],
          [matchers.call.fn(generateCatalystImage), Promise.resolve({ hash: 'someHash', content: blob })],
          [matchers.call.fn(calculateModelFinalSize), Promise.resolve(MAX_FILE_SIZE)],
          [matchers.call.fn(calculateFileSize), MAX_THUMBNAIL_FILE_SIZE + 1]
        ])
        .put(
          saveItemFailure(
            item,
            { ...contents, [THUMBNAIL_PATH]: blob },
            'The thumbnail file is too big to be uploaded. The max size is 1MB.'
          )
        )
        .dispatch(saveItemRequest(item, { ...contents, [THUMBNAIL_PATH]: blob }))
        .run({ silenceTimeout: true })
    })
  })

  describe('and video file size is larger than 250MB', () => {
    it('should put a saveItemFailure action with video too big message', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItem, item.id), undefined],
          [matchers.call.fn(reHashOlderContents), {}],
          [matchers.call.fn(generateCatalystImage), Promise.resolve({ hash: 'someHash', content: blob })],
          [matchers.call.fn(calculateModelFinalSize), Promise.resolve(MAX_FILE_SIZE)],
          [matchers.call.fn(calculateFileSize), MAX_VIDEO_FILE_SIZE + 1]
        ])
        .put(
          saveItemFailure(
            item,
            { ...contents, [VIDEO_PATH]: blob },
            'File size limit is 250MB. Please reduce the size of the file and try again.'
          )
        )
        .dispatch(saveItemRequest(item, { ...contents, [VIDEO_PATH]: blob }))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the collection is locked', () => {
    let collection: Collection
    let lock: number

    beforeEach(() => {
      lock = Date.now()
      collection = { id: uuidv4(), name: 'valid name', lock } as Collection
      item.name = 'valid name'
      item.description = 'valid description'
      item.collectionId = collection.id
      jest.spyOn(Date, 'now').mockReturnValueOnce(lock)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should dispatch the saveItemFailure signaling that the item is locked and not save the item', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [matchers.call.fn(reHashOlderContents), {}],
          [select(getItem, item.id), undefined],
          [select(getCollection, collection.id), collection],
          [matchers.call.fn(calculateModelFinalSize), Promise.resolve(1)],
          [matchers.call.fn(calculateFileSize), 1]
        ])
        .put(saveItemFailure(item, contents, 'The collection is locked'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the name and description don\'t contain ":", the size is below the limit, and the collection is not locked', () => {
    let contentsToSave: Record<string, Blob>
    const catalystImageHash = 'someHash'

    beforeEach(() => {
      item.name = 'valid name'
      item.description = 'valid description'
      item.updatedAt = updatedAt
    })

    describe("and the item doesn't have a new thumbnail image but has a catalyst image", () => {
      beforeEach(() => {
        item = { ...item, contents: { ...item.contents, [IMAGE_PATH]: 'anotherHash' } }
        contentsToSave = { ...contents, [IMAGE_PATH]: blob }
      })

      it('should put a save item success action with the catalyst image', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [matchers.call.fn(reHashOlderContents), {}],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getItem, item.id), undefined],
            [select(getAddress), mockAddress],
            [
              call(generateCatalystImage, item, {
                thumbnail: contents[THUMBNAIL_PATH]
              }),
              Promise.resolve({ hash: catalystImageHash, content: blob })
            ],
            [matchers.call.fn(calculateModelFinalSize), Promise.resolve(1)],
            [matchers.call.fn(calculateFileSize), 1],
            [call([builderAPI, 'saveItem'], item, contentsToSave), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, contentsToSave))
          .dispatch(saveItemRequest(item, contentsToSave))
          .run({ silenceTimeout: true })
      })
    })

    describe("and the item has a new thumbnail but doesn't have a catalyst image", () => {
      let itemWithCatalystImage: Item

      beforeEach(() => {
        delete item.contents[IMAGE_PATH]
        contents = { ...contents, [THUMBNAIL_PATH]: new Blob(['someThumbnailData']) }
        contentsToSave = { ...contents, [IMAGE_PATH]: blob }
        itemWithCatalystImage = { ...item, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash } }
      })

      it('should put a save item success action with the catalyst image', () => {
        const { [THUMBNAIL_PATH]: thumbnailContent, ...modelContents } = contentsToSave
        const { [THUMBNAIL_PATH]: _, ...itemContents } = itemWithCatalystImage.contents
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [matchers.call.fn(reHashOlderContents), {}],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getItem, item.id), undefined],
            [select(getAddress), mockAddress],
            [
              call(generateCatalystImage, item, {
                thumbnail: contents[THUMBNAIL_PATH]
              }),
              Promise.resolve({ hash: catalystImageHash, content: blob })
            ],
            [
              call(calculateModelFinalSize, { ...itemWithCatalystImage, contents: itemContents }, modelContents, builderAPI),
              Promise.resolve(1)
            ],
            [call(calculateFileSize, thumbnailContent), 1],
            [call([builderAPI, 'saveItem'], item, contentsToSave), Promise.resolve()]
          ])
          .put(saveItemSuccess(itemWithCatalystImage, contentsToSave))
          .dispatch(saveItemRequest(item, contentsToSave))
          .run({ silenceTimeout: true })
      })
    })

    describe("and the item doesn't have a new thumbnail and has a catalyst image", () => {
      beforeEach(() => {
        item = { ...item, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash } }
      })

      it('should put a save item success action without a new catalyst image', () => {
        const { [THUMBNAIL_PATH]: thumbnailContent, ...modelContents } = contents
        const { [THUMBNAIL_PATH]: _, ...itemContents } = item.contents
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [matchers.call.fn(reHashOlderContents), {}],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getItem, item.id), undefined],
            [select(getAddress), mockAddress],
            [call(calculateModelFinalSize, { ...item, contents: itemContents }, modelContents, builderAPI), Promise.resolve(1)],
            [call(calculateFileSize, thumbnailContent), 1],
            [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, contents))
          .dispatch(saveItemRequest(item, contents))
          .run({ silenceTimeout: true })
      })
    })

    describe("and the item doesn't have a new thumbnail, has a catalyst image but the rarity was changed", () => {
      let itemWithCatalystImage: Item
      let newContentsContainingNewCatalystImage: Record<string, Blob>

      beforeEach(() => {
        item = { ...item, rarity: ItemRarity.UNIQUE, contents: { ...item.contents, [IMAGE_PATH]: 'someOtherCatalystHash' } }
        itemWithCatalystImage = { ...item, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash } }
        newContentsContainingNewCatalystImage = { ...contents, [IMAGE_PATH]: blob }
      })

      it('should put a save item success action with a new catalyst image', () => {
        const { [THUMBNAIL_PATH]: thumbnailContent, ...modelContents } = newContentsContainingNewCatalystImage
        const { [THUMBNAIL_PATH]: _, ...itemContents } = itemWithCatalystImage.contents
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [matchers.call.fn(reHashOlderContents), {}],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [
              select(getItem, item.id),
              { ...item, contents: { ...item.contents, [IMAGE_PATH]: item.contents[IMAGE_PATH] }, rarity: ItemRarity.COMMON }
            ],
            [select(getAddress), mockAddress],
            [
              call(generateCatalystImage, item, {
                thumbnail: contents[THUMBNAIL_PATH]
              }),
              Promise.resolve({ hash: catalystImageHash, content: blob })
            ],
            [
              call(calculateModelFinalSize, { ...itemWithCatalystImage, contents: itemContents }, modelContents, builderAPI),
              Promise.resolve(1)
            ],
            [call(calculateFileSize, thumbnailContent), 1],
            [call([builderAPI, 'saveItem'], itemWithCatalystImage, newContentsContainingNewCatalystImage), Promise.resolve()]
          ])
          .put(saveItemSuccess(itemWithCatalystImage, newContentsContainingNewCatalystImage))
          .dispatch(saveItemRequest(item, contents))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the item is not published', () => {
      beforeEach(() => {
        item = { ...item, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash } }
      })

      it('should put a save item success action', () => {
        const { [THUMBNAIL_PATH]: thumbnailContent, ...modelContents } = contents
        const { [THUMBNAIL_PATH]: _, ...itemContents } = item.contents
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [matchers.call.fn(reHashOlderContents), {}],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getItem, item.id), undefined],
            [select(getAddress), mockAddress],
            [call(calculateModelFinalSize, { ...item, contents: itemContents }, modelContents, builderAPI), Promise.resolve(1)],
            [call(calculateFileSize, thumbnailContent), 1],
            [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, contents))
          .dispatch(saveItemRequest(item, contents))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the item is already published', () => {
      beforeEach(() => {
        item = { ...item, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash }, isPublished: true }
      })

      it('should save item if it is already published', () => {
        const { [THUMBNAIL_PATH]: thumbnailContent, ...modelContents } = contents
        const { [THUMBNAIL_PATH]: _, ...itemContents } = item.contents
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [matchers.call.fn(reHashOlderContents), {}],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getItem, item.id), undefined],
            [select(getAddress), mockAddress],
            [call(calculateModelFinalSize, { ...item, contents: itemContents }, modelContents, builderAPI), Promise.resolve(1)],
            [call(calculateFileSize, thumbnailContent), 1],
            [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, contents))
          .dispatch(saveItemRequest(item, contents))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the item has no content', () => {
      beforeEach(() => {
        item = { ...item, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash } }
      })

      it('should not calculate the size of the contents', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [matchers.call.fn(reHashOlderContents), {}],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getItem, item.id), undefined],
            [select(getAddress), mockAddress],
            [call([builderAPI, 'saveItem'], item, {}), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, {}))
          .dispatch(saveItemRequest(item, {}))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the item has old hashed content', () => {
      let itemWithNewHashes: Item
      let newContents: Record<string, Blob>

      beforeEach(() => {
        item = { ...item, contents: { ...item.contents, 'anItemContent.glb': 'QmOldHash', [IMAGE_PATH]: catalystImageHash } }
        itemWithNewHashes = { ...item, contents: { ...item.contents, 'anItemContent.glb': 'newHash' } }
        newContents = { ...contents, 'anItemContent.glb': blob }
      })

      it("should update the item's content with the new hash and upload the files", () => {
        const { [THUMBNAIL_PATH]: thumbnailContent, ...modelContents } = newContents
        const { [THUMBNAIL_PATH]: _, ...itemContents } = itemWithNewHashes.contents
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [
              call(reHashOlderContents, item.contents, builderAPI),
              {
                'anItemContent.glb': { hash: 'newHash', content: blob }
              }
            ],
            [select(getLocation), { pathname: 'notTPdetailPage' }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getItem, item.id), item],
            [select(getAddress), mockAddress],
            [
              call(calculateModelFinalSize, { ...itemWithNewHashes, contents: itemContents }, modelContents, builderAPI),
              Promise.resolve(1)
            ],
            [call(calculateFileSize, thumbnailContent), 1],
            [call([builderAPI, 'saveItem'], itemWithNewHashes, newContents), Promise.resolve()]
          ])
          .put(saveItemSuccess(itemWithNewHashes, newContents))
          .dispatch(saveItemRequest(item, contents))
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when handling the save item success action', () => {
  let collection: Collection
  let item: Item

  beforeEach(() => {
    collection = {
      id: 'aCollection'
    } as Collection
    item = { ...mockedItem, collectionId: collection.id }
  })

  describe('and the location is the TP detail page', () => {
    describe('and the new item will be in the same page', () => {
      let paginationData: ItemPaginationData
      beforeEach(() => {
        paginationData = { currentPage: 1, limit: 20, total: 5, ids: [item.id], totalPages: 1 }
      })
      it('should put a fetch collection items success action to fetch the same page again', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(item.collectionId) }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getPaginationData, item.collectionId!), paginationData],
            [select(getAddress), mockAddress]
          ])
          .put(fetchCollectionItemsRequest(item.collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
          .dispatch(saveItemSuccess(item, contents))
          .run({ silenceTimeout: true })
      })
    })
    describe('and the new item will be in another page', () => {
      let paginationData: ItemPaginationData
      beforeEach(() => {
        paginationData = { currentPage: 1, limit: 1, total: 1, ids: [item.id], totalPages: 1 }
      })
      it('should put a fetch collection items success action to fetch the same page again', () => {
        const newPageNumber = Math.ceil((paginationData.total + paginationData.ids.length) / paginationData.limit)
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(item.collectionId) }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getPaginationData, item.collectionId!), paginationData],
            [select(getAddress), mockAddress]
          ])
          .put(push(locations.thirdPartyCollectionDetail(item.collectionId, { page: newPageNumber })))
          .dispatch(saveItemSuccess(item, contents))
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('and the location is the Collection detail page', () => {
    describe('and the CreateSingleItemModal is opened', () => {
      describe('and the item type is wearable', () => {
        it('should close the modal CreateSingleItemModal', () => {
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getLocation), { pathname: locations.collectionDetail(collection.id) }],
              [select(getOpenModals), { CreateSingleItemModal: true }],
              [select(getAddress), mockAddress]
            ])
            .put(closeModal('CreateSingleItemModal'))
            .dispatch(saveItemSuccess(item, {}))
            .run({ silenceTimeout: true })
        })
      })

      describe('and the item type is emote', () => {
        beforeEach(() => {
          item = { ...item, type: ItemType.EMOTE }
        })

        it('should put a location change to the item editor', () => {
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getLocation), { pathname: locations.collectionDetail(collection.id) }],
              [select(getOpenModals), { CreateSingleItemModal: true }],
              [select(getAddress), mockAddress]
            ])
            .put(
              push(locations.itemEditor({ collectionId: collection.id, itemId: item.id, newItem: item.name }), {
                fromParam: FromParam.COLLECTIONS
              })
            )
            .dispatch(saveItemSuccess(item, {}))
            .run({ silenceTimeout: true })
        })
      })
    })
  })

  describe('and the location is the Item editor page', () => {
    let paginationData: ItemPaginationData
    beforeEach(() => {
      paginationData = { currentPage: 1, limit: 1, total: 1, ids: [item.id], totalPages: 1 }
    })

    describe('and the CreateSingleItemModal is opened', () => {
      describe('and the item type is wearable', () => {
        it('should close the modal CreateSingleItemModal', () => {
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getLocation), { pathname: locations.itemEditor() }],
              [select(getOpenModals), { CreateSingleItemModal: true }],
              [select(getAddress), mockAddress],
              [select(getPaginationData, item.collectionId!), { ...paginationData }]
            ])
            .put(fetchCollectionItemsRequest(item.collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
            .put(closeModal('CreateSingleItemModal'))
            .dispatch(saveItemSuccess(item, {}))
            .run({ silenceTimeout: true })
        })
      })

      describe('and the item type is emote', () => {
        beforeEach(() => {
          item = { ...item, type: ItemType.EMOTE }
        })

        describe('and the FF EmotesFlow is enabled', () => {
          it('should close the modal CreateSingleItemModal', () => {
            return expectSaga(itemSaga, builderAPI, builderClient)
              .provide([
                [select(getLocation), { pathname: locations.itemEditor() }],
                [select(getOpenModals), { CreateSingleItemModal: true }],
                [select(getAddress), mockAddress],
                [select(getPaginationData, item.collectionId!), { ...paginationData }]
              ])
              .put(fetchCollectionItemsRequest(item.collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
              .put(closeModal('CreateSingleItemModal'))
              .dispatch(saveItemSuccess(item, {}))
              .run({ silenceTimeout: true })
          })
        })

        describe('and the FF EmotesFlow is disabled', () => {
          it('should close the modal CreateSingleItemModal', () => {
            return expectSaga(itemSaga, builderAPI, builderClient)
              .provide([
                [select(getLocation), { pathname: locations.itemEditor() }],
                [select(getOpenModals), { CreateSingleItemModal: true }],
                [select(getAddress), mockAddress],
                [select(getPaginationData, item.collectionId!), { ...paginationData }]
              ])
              .put(fetchCollectionItemsRequest(item.collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
              .put(closeModal('CreateSingleItemModal'))
              .dispatch(saveItemSuccess(item, {}))
              .run({ silenceTimeout: true })
          })
        })
      })
    })
  })
})

describe('when handling the setPriceAndBeneficiaryRequest action', () => {
  describe('and the item is published', () => {
    let mockEthers: jest.SpyInstance
    let contractInstanceMock: { items: () => Record<string, unknown> }

    beforeEach(() => {
      mockEthers = jest.spyOn(ethers, 'Contract')

      contractInstanceMock = {
        items: jest.fn().mockReturnValue({
          metadata: 'metadata'
        })
      }

      mockEthers.mockReturnValue(contractInstanceMock)
    })

    afterEach(() => {
      mockEthers.mockRestore()
    })

    it('should put a setPriceAndBeneficiarySuccess action', async () => {
      const collection = {
        id: 'aCollection'
      } as Collection

      const item = {
        id: 'anItem',
        tokenId: 'aTokenId',
        name: 'valid name',
        description: 'valid description',
        collectionId: collection.id,
        type: ItemType.WEARABLE,
        updatedAt,
        isPublished: true,
        data: {
          category: WearableCategory.HAT,
          representations: [
            {
              bodyShapes: [BodyShape.MALE, BodyShape.FEMALE],
              contents: ['model.glb', 'texture.png'],
              mainFile: 'model.glb',
              overrideHides: [],
              overrideReplaces: []
            }
          ] as WearableRepresentation[]
        },
        contents: {}
      } as Item

      const price = '1000'
      const beneficiary = '0xpepe'

      await expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItems), [item]],
          [select(getCollections), [collection]],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET],
          [matchers.call.fn(sendTransaction), Promise.resolve('0xhash')]
        ])
        .put(setPriceAndBeneficiarySuccess({ ...item, price, beneficiary }, ChainId.MATIC_MAINNET, '0xhash'))
        .dispatch(setPriceAndBeneficiaryRequest(item.id, price, beneficiary))
        .run({ silenceTimeout: true })

      expect(contractInstanceMock.items).toHaveBeenCalledWith(item.tokenId)
    })

    describe("and the itemId doesn't match any existing item", () => {
      it('should put a setPriceAndBeneficiaryFailure action with a sagas.item.not_found error message', () => {
        const collection = {
          id: 'aCollection'
        } as Collection

        const item = {
          id: 'anItem',
          name: 'valid name',
          description: 'valid description',
          collectionId: collection.id,
          updatedAt,
          isPublished: false,
          contents: {}
        } as Item

        const nonExistentItemId = 'non-existent-id'
        const errorMessage = 'Error message'

        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [select(getItems), [item]],
            [select(getCollections), [collection]],
            [call(t, 'sagas.item.not_found'), errorMessage]
          ])
          .put(setPriceAndBeneficiaryFailure(nonExistentItemId, '10000', '0xpepe', errorMessage))
          .dispatch(setPriceAndBeneficiaryRequest(nonExistentItemId, '10000', '0xpepe'))
          .run({ silenceTimeout: true })
      })
    })
  })
  describe('and the item is not published', () => {
    it('should put a setPriceAndBeneficiaryFailure action with a sagas.item.not_published error message', () => {
      const collection = {
        id: 'aCollection'
      } as Collection

      const item = {
        id: 'anItem',
        name: 'valid name',
        description: 'valid description',
        collectionId: collection.id,
        updatedAt,
        isPublished: false
      } as Item

      const errorMessage = 'Error message'

      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItems), [item]],
          [select(getCollections), [collection]],
          [call(t, 'sagas.item.not_published'), errorMessage]
        ])
        .put(setPriceAndBeneficiaryFailure(item.id, '10000', '0xpepe', errorMessage))
        .dispatch(setPriceAndBeneficiaryRequest(item.id, '10000', '0xpepe'))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when resetting an item to the state found in the catalyst', () => {
  const originalFetch = window.fetch

  const itemId = 'itemId'

  let itemsById: any
  let entitiesByItemId: Record<string, Entity>
  let replacedItem: any
  let replacedContents: any

  beforeEach(() => {
    window.fetch = jest.fn().mockResolvedValue({
      blob: () => Promise.resolve(blob)
    })

    itemsById = {
      [itemId]: {
        name: 'changed name',
        description: 'changed description',
        contents: { 'changed key': 'changed hash', [IMAGE_PATH]: 'catalystImageHash' },
        data: {
          hides: [WearableCategory.MASK],
          replaces: [WearableCategory.MASK],
          tags: ['changed tag'],
          category: WearableCategory.MASK,
          representations: [
            {
              bodyShapes: [BodyShape.FEMALE],
              contents: ['changed content'],
              mainFile: 'changed mainFile',
              overrideReplaces: [WearableCategory.MASK],
              overrideHides: [WearableCategory.MASK]
            }
          ]
        }
      }
    }

    entitiesByItemId = {
      [itemId]: {
        id: 'anEntity',
        version: 'v3',
        type: EntityType.WEARABLE,
        timestamp: Date.now(),
        pointers: [],
        content: [
          { file: 'key', hash: 'hash' },
          { file: IMAGE_PATH, hash: 'catalystImageHash' }
        ],
        metadata: {
          name: 'name',
          description: 'description',
          data: {
            hides: [WearableCategory.HAT],
            replaces: [WearableCategory.HAT],
            tags: ['tag'],
            category: WearableCategory.HAT,
            representations: [
              {
                bodyShapes: [BodyShape.MALE],
                contents: ['content'],
                mainFile: 'mainFile',
                overrideReplaces: [WearableCategory.HAT],
                overrideHides: [WearableCategory.HAT]
              }
            ]
          }
        }
      }
    }

    replacedItem = {
      name: 'name',
      description: 'description',
      contents: { key: 'hash', [IMAGE_PATH]: 'catalystImageHash' },
      data: {
        hides: [WearableCategory.HAT],
        replaces: [WearableCategory.HAT],
        tags: ['tag'],
        category: WearableCategory.HAT,
        representations: [
          {
            bodyShapes: [BodyShape.MALE],
            contents: ['content'],
            mainFile: 'mainFile',
            overrideReplaces: [WearableCategory.HAT],
            overrideHides: [WearableCategory.HAT]
          }
        ]
      }
    }

    replacedContents = { key: blob, [IMAGE_PATH]: blob }
  })

  afterAll(() => {
    window.fetch = originalFetch
  })

  it('should put a reset item success action', () => {
    return expectSaga(handleResetItemRequest as SagaType, resetItemRequest(itemId))
      .provide([
        [select(getItemsById), itemsById],
        [saveItemRequest(replacedItem, replacedContents), undefined],
        [select(getEntityByItemId), entitiesByItemId],
        [
          race({
            success: take(SAVE_ITEM_SUCCESS),
            failure: take(SAVE_ITEM_FAILURE)
          }),
          { success: {} }
        ]
      ])
      .put(saveItemRequest(replacedItem, replacedContents))
      .put(resetItemSuccess(itemId))
      .dispatch(resetItemRequest(itemId))
      .silentRun()
  })

  describe('and a saveItemFailure action happens after the save item request', () => {
    it('should put a resetItemFailure action with the saveItemFailure action action message', () => {
      const saveItemFailureMessage = 'saveItemFailure action message'

      return expectSaga(handleResetItemRequest as SagaType, resetItemRequest(itemId))
        .provide([
          [select(getItemsById), itemsById],
          [saveItemRequest(replacedItem, replacedContents), undefined],
          [select(getEntityByItemId), entitiesByItemId],
          [
            race({
              success: take(SAVE_ITEM_SUCCESS),
              failure: take(SAVE_ITEM_FAILURE)
            }),
            {
              failure: saveItemFailure({} as any, {}, saveItemFailureMessage)
            }
          ]
        ])
        .put(saveItemRequest(replacedItem, replacedContents))
        .put(resetItemFailure(itemId, saveItemFailureMessage))
        .dispatch(resetItemRequest(itemId))
        .silentRun()
    })
  })

  describe('and the entity has no content', () => {
    it('should put a resetItemFailure action with a content missing message', () => {
      return expectSaga(handleResetItemRequest as SagaType, resetItemRequest(itemId))
        .provide([
          [select(getItemsById), itemsById],
          [
            select(getEntityByItemId),
            {
              ...entitiesByItemId,
              [itemId]: {
                ...entitiesByItemId[itemId],
                content: undefined
              }
            }
          ]
        ])
        .put(resetItemFailure(itemId, 'Entity does not have content'))
        .dispatch(resetItemRequest(itemId))
        .silentRun()
    })
  })
})

describe('when handling the downloadItemRequest action', () => {
  let itemsById: Record<string, Item>

  beforeEach(() => {
    itemsById = {
      male: { id: 'male', name: 'male', contents: { 'male/model.glb': 'Qmhash' } as Record<string, string> } as Item,
      maleAndFemale: {
        id: 'maleAndFemale',
        name: 'male and female',
        contents: { 'male/model.glb': 'QmhashMale', 'female/model.glb': 'QmhashFemale' } as Record<string, string>
      } as Item,
      both: {
        id: 'both',
        name: 'both',
        contents: { 'male/model.glb': 'Qmhash', 'female/model.glb': 'Qmhash' } as Record<string, string>
      } as Item
    }
  })

  describe('when id is not found', () => {
    const itemId = 'invalid'
    it('should throw an error with a message that says the item was not found', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([[select(getItemsById), itemsById]])
        .put(downloadItemFailure(itemId, 'Item not found for itemId="invalid"'))
        .dispatch(downloadItemRequest(itemId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when an item has only one "male" representation', () => {
    it('should download a zip file with all the contents under a /male directory', () => {
      const itemId = 'male'
      const item = itemsById[itemId]
      const model = new Blob()
      const files: Record<string, Blob> = { 'male/model.glb': model }
      const zip: Record<string, Blob> = { 'male/model.glb': model }
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItemsById), itemsById],
          [call([builderAPI, 'fetchContents'], item.contents), files],
          [call(buildZipContents, files, false), zip],
          [call(downloadZip, 'male', zip), undefined]
        ])
        .put(downloadItemSuccess(itemId))
        .dispatch(downloadItemRequest(itemId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when an item has two different representations for male and female', () => {
    it('should download a zip file with both /male and /female directories', () => {
      const itemId = 'maleAndFemale'
      const item = itemsById[itemId]
      const maleModel = new Blob()
      const femaleModel = new Blob()
      const files: Record<string, Blob> = { 'male/model.glb': maleModel, 'female/model.glb': femaleModel }
      const zip: Record<string, Blob> = { 'male/model.glb': maleModel, 'female/model.glb': femaleModel }
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItemsById), itemsById],
          [call([builderAPI, 'fetchContents'], item.contents), files],
          [call(buildZipContents, files, false), zip],
          [call(downloadZip, 'male_and_female', zip), undefined]
        ])
        .put(downloadItemSuccess(itemId))
        .dispatch(downloadItemRequest(itemId))
        .run({ silenceTimeout: true })
    })
  })

  describe('when an item has two representations that are the same', () => {
    it('should download a zip file with no /male or /female directories', () => {
      const itemId = 'both'
      const item = itemsById[itemId]
      const model = new Blob()
      const files: Record<string, Blob> = { 'male/model.glb': model, 'female/model.glb': model }
      const zip: Record<string, Blob> = { 'model.glb': model }
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItemsById), itemsById],
          [call([builderAPI, 'fetchContents'], item.contents), files],
          [call(buildZipContents, files, true), zip],
          [call(downloadZip, 'both', zip), undefined]
        ])
        .put(downloadItemSuccess(itemId))
        .dispatch(downloadItemRequest(itemId))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the save multiple items requests action', () => {
  let items: Item[]
  let builtFiles: BuiltFile<Blob>[]
  let remoteItems: RemoteItem[]
  let savedFiles: string[]
  let paginationData: ItemPaginationData
  const error = 'anError'

  beforeEach(() => {
    items = [
      { ...mockedItem, currentContentHash: mockedRemoteItem.local_content_hash },
      { ...mockedItem, id: 'anotherItemId', currentContentHash: mockedRemoteItem.local_content_hash },
      { ...mockedItem, id: 'oneMoreItemId', currentContentHash: mockedRemoteItem.local_content_hash }
    ]
    remoteItems = [{ ...mockedRemoteItem }, { ...mockedRemoteItem, id: 'anotherItemId' }, { ...mockedRemoteItem, id: 'oneMoreItemId' }]
    savedFiles = ['aFile.zip', 'anotherFile.zip', 'oneMoreFile.zip']
    builtFiles = [
      {
        item: { ...mockedLocalItem },
        newContent: { ...mockedItemContents },
        fileName: 'aFile.zip'
      },
      {
        item: { ...mockedLocalItem, id: 'anotherItemId' },
        newContent: { ...mockedItemContents },
        fileName: 'anotherFile.zip'
      },
      {
        item: { ...mockedLocalItem, id: 'oneMoreItemId' },
        newContent: { ...mockedItemContents },
        fileName: 'oneMoreFile.zip'
      }
    ]
    paginationData = { currentPage: 1, limit: 1, total: 1, ids: items.map(item => item.id), totalPages: 1 }
  })

  describe('and all of the upsert requests succeed', () => {
    beforeEach(() => {
      ;(builderClient.upsertItem as jest.Mock).mockResolvedValueOnce(remoteItems[0])
      ;(builderClient.upsertItem as jest.Mock).mockResolvedValueOnce(remoteItems[1])
      ;(builderClient.upsertItem as jest.Mock).mockResolvedValueOnce(remoteItems[2])
    })
    it('should dispatch the update progress action for each uploaded item and the success action with the upserted items and the name of the files of the upserted items', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getLocation), { pathname: 'notTPDetailPage' }],
          [select(getOpenModals), { EditItemURNModal: true }]
        ])
        .put(updateProgressSaveMultipleItems(33))
        .put(updateProgressSaveMultipleItems(67))
        .put(updateProgressSaveMultipleItems(100))
        .put(saveMultipleItemsSuccess(items, savedFiles, []))
        .dispatch(saveMultipleItemsRequest(builtFiles))
        .run({ silenceTimeout: true })
    })

    describe('and should fetch the collection items again', () => {
      describe('and the new items will be in the same page', () => {
        let paginationData: ItemPaginationData
        beforeEach(() => {
          items[0].collectionId = 'aCollection'
          paginationData = { currentPage: 1, limit: 20, total: 5, ids: items.map(item => item.id), totalPages: 1 }
        })
        it('should request the same page of items if the user is in the TP detail page', () => {
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(items[0].collectionId) }],
              [select(getOpenModals), { EditItemURNModal: true }],
              [select(getPaginationData, items[0].collectionId!), paginationData]
            ])
            .put(fetchCollectionItemsRequest(items[0].collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
            .dispatch(saveMultipleItemsSuccess(items, savedFiles, []))
            .run({ silenceTimeout: true })
        })
      })
      describe('and the items will be on a new page', () => {
        let paginationData: ItemPaginationData
        beforeEach(() => {
          items[0].collectionId = 'aCollection'
          paginationData = { currentPage: 1, limit: 1, total: 1, ids: items.map(item => item.id), totalPages: 1 }
        })
        it('should push the tp detail page location with the new page of items', () => {
          const newPageNumber = Math.ceil((paginationData.total + items.length) / paginationData.limit)
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(items[0].collectionId) }],
              [select(getOpenModals), { EditItemURNModal: true }],
              [select(getPaginationData, items[0].collectionId!), paginationData]
            ])
            .put(push(locations.thirdPartyCollectionDetail(items[0].collectionId, { page: newPageNumber })))
            .dispatch(saveMultipleItemsSuccess(items, savedFiles, []))
            .run({ silenceTimeout: true })
        })
      })
    })
  })

  describe('and one of the upsert requests fails', () => {
    beforeEach(() => {
      ;(builderClient.upsertItem as jest.Mock).mockResolvedValueOnce(remoteItems[0])
      ;(builderClient.upsertItem as jest.Mock).mockRejectedValueOnce(new Error(error))
      ;(builderClient.upsertItem as jest.Mock).mockResolvedValueOnce(remoteItems[2])
    })
    it('should dispatch the update progress action for the non-failing item upload and the success action with the items that failed, the upserted items and the name of the files of the upserted items', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(items[0].collectionId) }],
          [select(getPaginationData, items[0].collectionId!), paginationData]
        ])
        .put(updateProgressSaveMultipleItems(100))
        .put(saveMultipleItemsSuccess([items[0], items[2]], [savedFiles[0], savedFiles[2]], [savedFiles[1]]))
        .dispatch(saveMultipleItemsRequest(builtFiles))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the operation gets cancelled', () => {
    let builtFilesThatWillCancelled: BuiltFile<Blob>[]
    let amountOfFilesThatWillBeCancelled: number
    let savedFilesWithCancelled: string[]
    beforeEach(() => {
      amountOfFilesThatWillBeCancelled = 2
      builtFilesThatWillCancelled = Array.from({ length: SAVE_AND_EDIT_FILES_BATCH_SIZE + amountOfFilesThatWillBeCancelled }, (_, i) => ({
        ...builtFiles[0],
        fileName: `anotherFile${i}.zip`
      }))
      savedFilesWithCancelled = builtFilesThatWillCancelled.map(file => file.fileName)
      ;(builderClient.upsertItem as jest.Mock).mockResolvedValue(remoteItems[0])
    })
    it('should dispatch the update progress action for the first non-cancelled upsert and the cancelling action with the upserted items and the name of the files of the upserted items', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(items[0].collectionId) }],
          [select(getPaginationData, items[0].collectionId!), paginationData]
        ])
        .put(
          updateProgressSaveMultipleItems(
            Math.round(((builtFilesThatWillCancelled.length - amountOfFilesThatWillBeCancelled) / builtFilesThatWillCancelled.length) * 100)
          )
        )
        .put(
          saveMultipleItemsCancelled(
            Array(SAVE_AND_EDIT_FILES_BATCH_SIZE).fill(items[0]),
            savedFilesWithCancelled.slice(0, SAVE_AND_EDIT_FILES_BATCH_SIZE),
            [],
            savedFilesWithCancelled.slice(-amountOfFilesThatWillBeCancelled)
          )
        )
        .dispatch(saveMultipleItemsRequest(builtFilesThatWillCancelled))
        .dispatch(cancelSaveMultipleItems())
        .run({ silenceTimeout: true })
    })

    describe('and should fetch the collection items again', () => {
      describe('and the new items will be in the same page', () => {
        let paginationData: ItemPaginationData
        beforeEach(() => {
          items[0].collectionId = 'aCollection'
          paginationData = { currentPage: 1, limit: 20, total: 5, ids: items.map(item => item.id), totalPages: 1 }
        })
        it('should request the same page of items if the user is in the TP detail page', () => {
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(items[0].collectionId) }],
              [select(getOpenModals), { EditItemURNModal: true }],
              [select(getPaginationData, items[0].collectionId!), paginationData]
            ])
            .put(fetchCollectionItemsRequest(items[0].collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
            .dispatch(
              saveMultipleItemsCancelled(
                Array(SAVE_AND_EDIT_FILES_BATCH_SIZE).fill(items[0]),
                savedFilesWithCancelled.slice(0, SAVE_AND_EDIT_FILES_BATCH_SIZE),
                [],
                savedFilesWithCancelled.slice(-amountOfFilesThatWillBeCancelled)
              )
            )
            .run({ silenceTimeout: true })
        })
      })
      describe('and the items will be on a new page', () => {
        let paginationData: ItemPaginationData
        beforeEach(() => {
          items[0].collectionId = 'aCollection'
          paginationData = { currentPage: 1, limit: 1, total: 1, ids: items.map(item => item.id), totalPages: 1 }
        })
        it('should push the tp detail page location with the new page of items', () => {
          const newPageNumber = Math.ceil(
            (paginationData.total + (savedFilesWithCancelled.length - amountOfFilesThatWillBeCancelled)) / paginationData.limit
          )
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(items[0].collectionId) }],
              [select(getOpenModals), { EditItemURNModal: true }],
              [select(getPaginationData, items[0].collectionId!), paginationData]
            ])
            .put(push(locations.thirdPartyCollectionDetail(items[0].collectionId, { page: newPageNumber })))
            .dispatch(
              saveMultipleItemsCancelled(
                Array(SAVE_AND_EDIT_FILES_BATCH_SIZE).fill(items[0]),
                savedFilesWithCancelled.slice(0, SAVE_AND_EDIT_FILES_BATCH_SIZE),
                [],
                savedFilesWithCancelled.slice(-amountOfFilesThatWillBeCancelled)
              )
            )
            .run({ silenceTimeout: true })
        })
      })
    })

    describe('and should not fetch the collection items again if they were all cancelled', () => {
      describe('and the new items will be in the same page', () => {
        let paginationData: ItemPaginationData
        beforeEach(() => {
          items[0].collectionId = 'aCollection'
          paginationData = { currentPage: 1, limit: 20, total: 5, ids: items.map(item => item.id), totalPages: 1 }
        })
        it('should request the same page of items if the user is in the TP detail page', () => {
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(items[0].collectionId) }],
              [select(getOpenModals), { EditItemURNModal: true }],
              [select(getPaginationData, items[0].collectionId!), paginationData]
            ])
            .not.put(fetchCollectionItemsRequest(items[0].collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
            .dispatch(saveMultipleItemsCancelled([], [], [], savedFilesWithCancelled))
            .run({ silenceTimeout: true })
        })
      })
    })
  })
})

describe('when handling the rescue items request action', () => {
  const txHash = '0x12345'
  const transactionData = 'some-data'
  let collection: Collection
  let items: Item[]
  let resultItems: Item[]
  let contentHashes: string[]
  let groupsOfItems: Item[][]
  let groupsOfContentHashes: string[][]

  beforeEach(() => {
    const item = {
      type: ItemType.WEARABLE,
      name: 'aName',
      description: 'someDescription',
      data: {
        category: WearableCategory.EARRING,
        representations: [
          {
            bodyShapes: [BodyShape.MALE]
          }
        ]
      },
      contents: {}
    } as Item

    items = Array.from({ length: 55 }, (_, i) => ({ ...item, id: `item-${i}`, tokenId: `${i}` })) as Item[]
    contentHashes = Array.from({ length: items.length }, (_, i) => `content-hash-${i}`)
    collection = { id: 'aCollection', contractAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' } as Collection

    resultItems = items.map((item, index) => ({ ...item, blockchainContentHash: contentHashes[index] }))
    groupsOfItems = groupsOf(items, MAX_ITEMS)
    groupsOfContentHashes = groupsOf(contentHashes, MAX_ITEMS)
  })

  describe('and the meta transactions are successful', () => {
    it('should dispatch a rescueItemsChunkSuccess per chunk and the rescueItemsSuccess once the transactions finish', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [matchers.call.fn(getMethodData), transactionData],
          [matchers.call.fn(sendTransaction), txHash],
          [take(FETCH_TRANSACTION_SUCCESS), { payload: { transaction: { hash: txHash } } }]
        ])
        .put(rescueItemsChunkSuccess(collection, groupsOfItems[0], groupsOfContentHashes[0], ChainId.MATIC_MUMBAI, txHash))
        .put(rescueItemsChunkSuccess(collection, groupsOfItems[1], groupsOfContentHashes[1], ChainId.MATIC_MUMBAI, txHash))
        .put(rescueItemsSuccess(collection, resultItems, contentHashes, ChainId.MATIC_MUMBAI, [txHash, txHash]))
        .dispatch(rescueItemsRequest(collection, items, contentHashes))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the meta transactions are unsuccessful', () => {
    describe('and the transaction fails to get mined', () => {
      it('should dispatch the rescueItemsFailure with the information about the error', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
            [matchers.call.fn(getMethodData), transactionData],
            [matchers.call.fn(sendTransaction), Promise.reject(new Error('some-error'))]
          ])
          .put(rescueItemsFailure(collection, items, contentHashes, 'some-error'))
          .dispatch(rescueItemsRequest(collection, items, contentHashes))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the call to the transaction service fails', () => {
      it('should dispatch the rescueItemsFailure with the information about the error', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
            [matchers.call.fn(getMethodData), transactionData],
            [matchers.call.fn(sendTransaction), txHash],
            [take(FETCH_TRANSACTION_FAILURE), { payload: { transaction: { hash: txHash } } }]
          ])
          .put(rescueItemsFailure(collection, items, contentHashes, `The transaction ${txHash} failed to be mined.`))
          .dispatch(rescueItemsRequest(collection, items, contentHashes))
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when handling the fetch of collection items', () => {
  let item: Item
  let paginationData: PaginatedResource<Item>
  beforeEach(() => {
    item = { ...mockedItem }
    paginationData = {
      results: [{ ...mockedItem }],
      limit: 50,
      page: 1,
      pages: 1,
      total: 1
    }
  })
  describe('and the request is successful', () => {
    beforeEach(() => {
      ;(builderAPI.fetchCollectionItems as jest.Mock).mockReturnValue(paginationData)
    })
    it('should put a fetchCollectionItemsSuccess action with items and pagination data', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .dispatch(fetchCollectionItemsRequest(item.collectionId!, { page: 1, limit: paginationData.limit }))
        .put(
          fetchCollectionItemsSuccess(item.collectionId!, [item], {
            limit: paginationData.limit,
            page: paginationData.page,
            pages: paginationData.pages,
            total: paginationData.total
          })
        )
        .run({ silenceTimeout: true })
    })
  })
  describe('and the request fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'an error'
      ;(builderAPI.fetchCollectionItems as jest.Mock).mockRejectedValue(new Error(errorMessage))
    })
    it('should put a fetchCollectionItemsFailure action with items and pagination data', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .dispatch(fetchCollectionItemsRequest(item.collectionId!, { page: 1, limit: paginationData.limit }))
        .put(fetchCollectionItemsFailure(item.collectionId!, errorMessage))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the fetch of collection items pages', () => {
  let item: Item
  let paginationData: PaginatedResource<Item>
  beforeEach(() => {
    item = { ...mockedItem }
    paginationData = {
      results: [{ ...mockedItem }],
      limit: 50,
      page: 1,
      pages: 1,
      total: 1
    }
  })
  describe('and the request is successful', () => {
    beforeEach(() => {
      ;(builderAPI.fetchCollectionItems as jest.Mock).mockReturnValue(paginationData)
    })
    it('should put a fetchCollectionItemsSuccess action with items and pagination data', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .dispatch(
          fetchCollectionItemsRequest(item.collectionId!, { page: [1], limit: paginationData.limit, overridePaginationData: false })
        )
        .put(fetchCollectionItemsSuccess(item.collectionId!, [item], undefined))
        .run({ silenceTimeout: true })
    })
  })
  describe('and the request fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'an error'
      ;(builderAPI.fetchCollectionItems as jest.Mock).mockRejectedValue(new Error(errorMessage))
    })
    it('should put a fetchCollectionItemsFailure action with items and pagination data', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .dispatch(fetchCollectionItemsRequest(item.collectionId!, { page: [1], limit: paginationData.limit }))
        .put(fetchCollectionItemsFailure(item.collectionId!, errorMessage))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the delete item success action', () => {
  let item: Item
  beforeEach(() => {
    item = { ...mockedItem }
  })
  describe('and the location is the TP detail page', () => {
    describe('and the deleted item in not the only item in the current page', () => {
      let paginationData: ItemPaginationData
      beforeEach(() => {
        paginationData = { currentPage: 3, limit: 20, total: 65, ids: [item.id, item.id], totalPages: 3 }
      })
      it('should put a fetch collection items success action to fetch the same page again', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [select(getAddress), mockAddress],
            [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(item.collectionId) }],
            [select(getOpenModals), { EditItemURNModal: true }],
            [select(getPaginationData, item.collectionId!), paginationData]
          ])
          .put(fetchCollectionItemsRequest(item.collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
          .dispatch(deleteItemSuccess(item))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the deleted item is the only item of the page', () => {
      describe('and the page has a previous one', () => {
        let paginationData: ItemPaginationData
        beforeEach(() => {
          paginationData = { currentPage: 3, limit: 20, total: 61, ids: [item.id], totalPages: 3 }
        })
        it('should put a fetch collection items success action to fetch the previous page', () => {
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getAddress), mockAddress],
              [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(item.collectionId) }],
              [select(getOpenModals), { EditItemURNModal: true }],
              [select(getPaginationData, item.collectionId!), paginationData]
            ])
            .put(push(locations.thirdPartyCollectionDetail(item.collectionId, { page: paginationData.currentPage - 1 })))
            .dispatch(deleteItemSuccess(item))
            .run({ silenceTimeout: true })
        })
      })

      describe('and the current page is the first page', () => {
        let paginationData: ItemPaginationData
        beforeEach(() => {
          paginationData = { currentPage: 1, limit: 20, total: 1, ids: [item.id], totalPages: 1 }
        })
        it('should put a fetch collection items success action to fetch the same first page', () => {
          return expectSaga(itemSaga, builderAPI, builderClient)
            .provide([
              [select(getAddress), mockAddress],
              [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(item.collectionId) }],
              [select(getOpenModals), { EditItemURNModal: true }],
              [select(getPaginationData, item.collectionId!), paginationData]
            ])
            .put(fetchCollectionItemsRequest(item.collectionId!, { page: paginationData.currentPage, limit: paginationData.limit }))
            .dispatch(deleteItemSuccess(item))
            .run({ silenceTimeout: true })
        })
      })
    })
  })
  describe('and the location /collections page', () => {
    let paginationData: ItemPaginationData
    beforeEach(() => {
      paginationData = { currentPage: 3, limit: 20, total: 65, ids: [item.id, item.id], totalPages: 3 }
    })
    it('should put a fetch address items success action to fetch the same page again', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getAddress), mockAddress],
          [select(getLocation), { pathname: locations.collections() }],
          [select(getOpenModals), { EditItemURNModal: true }],
          [select(getPaginationData, mockAddress), paginationData]
        ])
        .put(fetchItemsRequest(mockAddress, { page: paginationData.currentPage, limit: paginationData.limit }))
        .dispatch(deleteItemSuccess(item))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the save item curation success action', () => {
  let item: Item
  beforeEach(() => {
    item = { ...mockedItem }
  })

  it('should put a fetch item curation request action if the item is a TP one', () => {
    return expectSaga(itemSaga, builderAPI, builderClient)
      .provide([
        [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(item.collectionId) }],
        [select(getOpenModals), { EditItemURNModal: true }],
        [select(getPaginationData, item.collectionId!), {}],
        [select(getAddress), mockAddress]
      ])
      .put(fetchItemCurationRequest(item.collectionId!, item.id))
      .dispatch(
        saveItemSuccess(
          { ...item, isPublished: true, urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:one-third-party-collection' },
          {}
        )
      )
      .run({ silenceTimeout: true })
  })

  it('should not put a fetch item curation request action if the item is a standard one', () => {
    return expectSaga(itemSaga, builderAPI, builderClient)
      .provide([
        [select(getLocation), { pathname: locations.thirdPartyCollectionDetail(item.collectionId) }],
        [select(getOpenModals), { EditItemURNModal: true }],
        [select(getPaginationData, item.collectionId!), {}],
        [select(getAddress), mockAddress]
      ])
      .not.put(fetchItemCurationRequest(item.collectionId!, item.id))
      .dispatch(saveItemSuccess(item, {}))
      .run({ silenceTimeout: true })
  })

  it('should not put a location change to the item detail if the CreateSingleItemModal was opened and the location was not /collections', () => {
    return expectSaga(itemSaga, builderAPI, builderClient)
      .provide([
        [select(getLocation), { pathname: locations.collectionDetail('id') }],
        [select(getOpenModals), { CreateSingleItemModal: true }],
        [select(getAddress), mockAddress],
        [select(getPaginationData, mockAddress), { currentPage: 1, limit: 10 }]
      ])
      .not.put(push(locations.itemDetail(item.id)))
      .dispatch(saveItemSuccess(item, {}))
      .run({ silenceTimeout: true })
  })
})

describe('when handling the fetch of rarities', () => {
  let rarities: Rarity[]

  beforeEach(() => {
    rarities = [
      {
        id: ItemRarity.COMMON,
        name: ItemRarity.COMMON,
        price: '4000000000000000000',
        maxSupply: '100000',
        prices: {
          [Currency.MANA]: '4000000000000000000',
          [Currency.USD]: '10000000000000000000'
        }
      }
    ]
  })

  it('should put a fetch rarities success action with the fetched rarities', () => {
    return expectSaga(itemSaga, builderAPI, builderClient)
      .provide([[call([builderAPI, builderAPI.fetchRarities]), rarities]])
      .dispatch(fetchRaritiesRequest())
      .put(fetchRaritiesSuccess(rarities))
      .run({ silenceTimeout: true })
  })

  describe('when the request to the builder fails', () => {
    it('should put a fetch rarities failure action with the error', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([[call([builderAPI, builderAPI.fetchRarities]), Promise.reject(new Error('Failed to fetch rarities'))]])
        .dispatch(fetchRaritiesRequest())
        .put(fetchRaritiesFailure('Failed to fetch rarities'))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the setCollection action', () => {
  describe('and the item is moved to the selected collection', () => {
    let paginationData: PaginatedResource<Item>
    beforeEach(() => {
      paginationData = { total: 0, limit: 20, page: 1, pages: 1, results: [] }
      ;(builderAPI.fetchItems as jest.Mock).mockReturnValue(paginationData)
    })

    it('should put a fetch address items success action to fetch the same page again', () => {
      const collection = {
        id: 'aCollection'
      } as Collection

      const item = { ...mockedItem }

      const catalystImageHash = 'someHash'

      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getAddress), mockAddress],
          [select(getLocation), { pathname: locations.collections() }],
          [select(getOpenModals), { AddExistingItemModal: true }],
          [select(getItem, item.id), item],
          [select(getCollection, collection.id), collection],
          [matchers.call.fn(reHashOlderContents), {}],
          [matchers.call.fn(generateCatalystImage), Promise.resolve({ hash: catalystImageHash, content: blob })],
          [matchers.call.fn(calculateModelFinalSize), Promise.resolve(1)],
          [matchers.call.fn(calculateFileSize), 1]
        ])
        .put(
          fetchItemsSuccess(
            paginationData.results,
            { limit: paginationData.limit, page: paginationData.page, pages: paginationData.pages, total: paginationData.total },
            mockAddress
          )
        )
        .dispatch(setCollection(item, collection.id))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the failure of setting token items id', () => {
  let collection: Collection
  let items: Item[]

  beforeEach(() => {
    collection = {
      id: 'aCollection'
    } as Collection

    items = [{ ...mockedItem }]
  })

  describe('when error code is 401', () => {
    it('should put the setItemsTokenIdRequest action to retry the request', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [delay(5000), void 0],
          [select(getCollection, collection.id), collection],
          [select(getCollectionItems, collection.id), items]
        ])
        .put(setItemsTokenIdRequest(collection, items))
        .dispatch(setItemsTokenIdFailure(collection, items, 'error message', 401))
        .run({ silenceTimeout: true })
    })
  })
  describe('when error code is not 401', () => {
    it('should display a toast message saying that the publishing failed', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [delay(5000), void 0],
          [select(getCollection, collection.id), collection],
          [select(getCollectionItems, collection.id), items]
        ])
        .put.like({ action: { type: SHOW_TOAST, payload: { toast: { type: ToastType.ERROR } } } })
        .dispatch(setItemsTokenIdFailure(collection, items, 'error message', 500))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the fetch of an orphan item', () => {
  let paginationData: PaginatedResource<Item>
  describe('and the request is successful', () => {
    describe('and there are orphan items', () => {
      beforeEach(() => {
        paginationData = {
          results: [{ ...mockedItem }],
          limit: 1,
          page: 1,
          pages: 1,
          total: 1
        }
        ;(builderAPI.fetchItems as jest.Mock).mockReturnValue(paginationData)
      })
      it('should put a fetchOrphanItemSuccess action with hasUserOrphanItems true', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .dispatch(fetchOrphanItemRequest(mockAddress))
          .put(fetchOrphanItemSuccess(paginationData.total !== 0))
          .run({ silenceTimeout: true })
      })
    })
    describe('and there are not orphan items', () => {
      beforeEach(() => {
        paginationData = {
          results: [],
          limit: 1,
          page: 1,
          pages: 1,
          total: 0
        }
        ;(builderAPI.fetchItems as jest.Mock).mockReturnValue(paginationData)
      })
      it('should put a fetchOrphanItemSuccess action with hasUserOrphanItems false', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .dispatch(fetchOrphanItemRequest(mockAddress))
          .put(fetchOrphanItemSuccess(paginationData.total !== 0))
          .run({ silenceTimeout: true })
      })
    })
  })
  describe('and the request fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'an error'
      ;(builderAPI.fetchItems as jest.Mock).mockRejectedValue(new Error(errorMessage))
    })
    it('should put a fetchOrphanItemFailure action with the error message', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .dispatch(fetchOrphanItemRequest(mockAddress))
        .put(fetchOrphanItemFailure(errorMessage))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the setItemCollection action', () => {
  let collection: Collection
  let item: Item
  let toast: ToastProps

  beforeEach(() => {
    collection = { id: 'aCollection' } as Collection
    item = { ...mockedItem, collectionId: collection.id, contents: { [IMAGE_PATH]: 'anotherHash' } }
    toast = {
      type: ToastType.INFO,
      title: 'Title',
      body: 'Body'
    }
    jest.spyOn(toasts, 'getSuccessfulMoveItemToAnotherCollectionToast').mockReturnValueOnce(toast)
  })

  it('should put a save item success action and show the successful move item to another collection toast', () => {
    return expectSaga(itemSaga, builderAPI, builderClient)
      .provide([
        [select(getOpenModals), { MoveItemToAnotherCollectionModal: true }],
        [select(getLocation), { pathname: 'collections' }],
        [select(getCollection, collection.id), collection.id],
        [select(getItem, item.id), item],
        [select(getAddress), mockAddress],
        [call([builderAPI, 'saveItem'], item, {}), Promise.resolve()]
      ])
      .put.like({ action: { type: SHOW_TOAST, payload: { toast, position: 'bottom center' } } })
      .put(closeModal('MoveItemToAnotherCollectionModal'))
      .dispatch(saveItemSuccess(item, {}))
      .dispatch(setItemCollection(item, collection.id))
      .run({ silenceTimeout: true })
  })
})
