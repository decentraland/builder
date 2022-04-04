import uuidv4 from 'uuid/v4'
import { expectSaga, SagaType } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { Entity, EntityType, EntityVersion } from 'dcl-catalyst-commons'
import { call, select, take, race } from 'redux-saga/effects'
import { BuilderClient, RemoteItem } from '@dcl/builder-client'
import { ChainId, Network, WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { FETCH_TRANSACTION_FAILURE, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import { MAX_ITEMS } from 'modules/collection/constants'
import { getMethodData } from 'modules/wallet/utils'
import { mockedItem, mockedItemContents, mockedLocalItem, mockedRemoteItem } from 'specs/item'
import { getCollections, getCollection } from 'modules/collection/selectors'
import { updateProgressSaveMultipleItems } from 'modules/ui/createMultipleItems/action'
import { downloadZip } from 'lib/zip'
import { BuilderAPI, PaginatedResource } from 'lib/api/builder'
import util from 'util'
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
  saveMultipleItemsFailure,
  saveMultipleItemsCancelled,
  cancelSaveMultipleItems,
  rescueItemsRequest,
  rescueItemsChunkSuccess,
  rescueItemsSuccess,
  rescueItemsFailure,
  fetchCollectionItemsRequest,
  fetchCollectionItemsSuccess,
  fetchCollectionItemsFailure,
  fetchCollectionItemsPagesRequest,
  fetchCollectionItemsPagesSuccess,
  fetchCollectionItemsPagesFailure
} from './actions'
import { itemSaga, handleResetItemRequest } from './sagas'
import { BuiltFile, IMAGE_PATH, Item, ItemRarity, ItemType, THUMBNAIL_PATH, WearableRepresentation } from './types'
import { calculateFinalSize } from './export'
import { buildZipContents, generateCatalystImage, groupsOf, MAX_FILE_SIZE } from './utils'
import { getData as getItemsById, getEntityByItemId, getItem, getItems } from './selectors'
import { getLocation } from 'connected-react-router'

let blob: Blob = new Blob()
let contents: Record<string, Blob>

const builderAPI = ({
  saveItem: jest.fn(),
  saveItemContents: jest.fn(),
  fetchContents: jest.fn(),
  fetchCollectionItems: jest.fn()
} as unknown) as BuilderAPI

let builderClient: BuilderClient

let dateNowSpy: jest.SpyInstance
const updatedAt = Date.now()

beforeEach(() => {
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => updatedAt)
  builderClient = ({
    upsertItem: jest.fn(),
    getContentSize: jest.fn()
  } as unknown) as BuilderClient
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

  describe('and file size is larger than 2 MB', () => {
    beforeEach(() => {
      item.name = 'valid name'
      item.description = 'valid description'
      item.updatedAt = updatedAt
    })

    it('should put a saveItemFailure action with item too big message', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItem, item.id), undefined],
          [matchers.call.fn(generateCatalystImage), Promise.resolve({ hash: 'someHash', content: blob })],
          [call(calculateFinalSize, item, contents), Promise.resolve(MAX_FILE_SIZE + 1)]
        ])
        .put(
          saveItemFailure(
            item,
            contents,
            'The entire item is too big to be uploaded. The max size for all files (including the thumbnail) is 2MB.'
          )
        )
        .dispatch(saveItemRequest(item, contents))
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
          [select(getItem, item.id), undefined],
          [select(getCollection, collection.id), collection],
          [call(calculateFinalSize, item, contents), Promise.resolve(1)]
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
            [select(getItem, item.id), undefined],
            [
              call(generateCatalystImage, item, {
                thumbnail: contents[THUMBNAIL_PATH]
              }),
              Promise.resolve({ hash: catalystImageHash, content: blob })
            ],
            [call(calculateFinalSize, item, contentsToSave), Promise.resolve(1)],
            [call([builderAPI, 'saveItem'], item, contentsToSave), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, contentsToSave))
          .dispatch(saveItemRequest(item, contentsToSave))
          .run({ silenceTimeout: true })
      })
    })

    describe("and the item has a new thumbnail but doesn't have a catalyst image", () => {
      beforeEach(() => {
        delete item.contents[IMAGE_PATH]
        contents = { ...contents, [THUMBNAIL_PATH]: new Blob(['someThumbnailData']) }
        contentsToSave = { ...contents, [IMAGE_PATH]: blob }
      })

      it('should put a save item success action with the catalyst image', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [select(getItem, item.id), undefined],
            [
              call(generateCatalystImage, item, {
                thumbnail: contents[THUMBNAIL_PATH]
              }),
              Promise.resolve({ hash: catalystImageHash, content: blob })
            ],
            [call(calculateFinalSize, item, contentsToSave), Promise.resolve(1)],
            [call([builderAPI, 'saveItem'], item, contentsToSave), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, contentsToSave))
          .dispatch(saveItemRequest(item, contentsToSave))
          .run({ silenceTimeout: true })
      })
    })

    describe("and the item doesn't have a new thumbnail and has a catalyst image", () => {
      beforeEach(() => {
        item = { ...item, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash } }
      })

      it('should put a save item success action without a new catalyst image', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [select(getItem, item.id), undefined],
            [call(calculateFinalSize, item, contents), Promise.resolve(1)],
            [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, contents))
          .dispatch(saveItemRequest(item, contents))
          .run({ silenceTimeout: true })
      })
    })

    describe("and the item doesn't have a new thumbnail, has a catalyst image but the rarity was changed", () => {
      beforeEach(() => {
        item = { ...item, rarity: ItemRarity.UNIQUE, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash } }
      })

      it('should put a save item success action with a new catalyst image', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [
              select(getItem, item.id),
              { ...item, contents: { ...item.contents, [IMAGE_PATH]: 'someOtherCatalystHash' }, rarity: ItemRarity.COMMON }
            ],
            [
              call(generateCatalystImage, item, {
                thumbnail: contents[THUMBNAIL_PATH]
              }),
              Promise.resolve({ hash: catalystImageHash, content: blob })
            ],
            [call(calculateFinalSize, item, contents), Promise.resolve(1)],
            [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, contents))
          .dispatch(saveItemRequest(item, contents))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the item is not published', () => {
      beforeEach(() => {
        item = { ...item, contents: { ...item.contents, [IMAGE_PATH]: catalystImageHash } }
      })

      it('should put a save item success action', () => {
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [select(getItem, item.id), undefined],
            [call(calculateFinalSize, item, contents), Promise.resolve(1)],
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
        return expectSaga(itemSaga, builderAPI, builderClient)
          .provide([
            [select(getItem, item.id), undefined],
            [call(calculateFinalSize, item, contents), Promise.resolve(1)],
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
            [select(getItem, item.id), undefined],
            [call([builderAPI, 'saveItem'], item, {}), Promise.resolve()]
          ])
          .put(saveItemSuccess(item, {}))
          .dispatch(saveItemRequest(item, {}))
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when handling the setPriceAndBeneficiaryRequest action', () => {
  describe('and the item is published', () => {
    util.inspect.defaultOptions.depth = 7

    it('should put a setPriceAndBeneficiarySuccess action', () => {
      const collection = {
        id: 'aCollection'
      } as Collection

      const item = {
        id: 'anItem',
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
              bodyShapes: [WearableBodyShape.MALE, WearableBodyShape.FEMALE],
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

      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [select(getItems), [item]],
          [select(getCollections), [collection]],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET],
          [matchers.call.fn(sendTransaction), Promise.resolve('0xhash')]
        ])
        .put(setPriceAndBeneficiarySuccess({ ...item, price, beneficiary }, ChainId.MATIC_MAINNET, '0xhash'))
        .dispatch(setPriceAndBeneficiaryRequest(item.id, price, beneficiary))
        .run({ silenceTimeout: true })
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

  window.fetch = jest.fn().mockResolvedValue({
    blob: () => Promise.resolve(blob)
  })

  const itemId = 'itemId'

  let itemsById: any
  let entitiesByItemId: Record<string, Entity>
  let replacedItem: any
  let replacedContents: any

  beforeEach(() => {
    itemsById = {
      [itemId]: {
        name: 'changed name',
        description: 'changed description',
        contents: { ['changed key']: 'changed hash', [IMAGE_PATH]: 'catalystImageHash' },
        data: {
          hides: [WearableCategory.MASK],
          replaces: [WearableCategory.MASK],
          tags: ['changed tag'],
          category: WearableCategory.MASK,
          representations: [
            {
              bodyShapes: [WearableBodyShape.FEMALE],
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
        version: EntityVersion.V3,
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
                bodyShapes: [WearableBodyShape.MALE],
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
            bodyShapes: [WearableBodyShape.MALE],
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
        [saveItemRequest(replacedItem as any, replacedContents), undefined],
        [select(getEntityByItemId), entitiesByItemId],
        [
          race({
            success: take(SAVE_ITEM_SUCCESS),
            failure: take(SAVE_ITEM_FAILURE)
          }),
          { success: {} }
        ]
      ])
      .put(saveItemRequest(replacedItem as any, replacedContents))
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
          [saveItemRequest(replacedItem as any, replacedContents), undefined],
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
        .put(saveItemRequest(replacedItem as any, replacedContents))
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
        .put(downloadItemFailure(itemId, `Item not found for itemId="invalid"`))
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
  const error = 'anError'

  beforeEach(() => {
    items = [
      { ...mockedItem, currentContentHash: mockedRemoteItem.local_content_hash },
      { ...mockedItem, id: 'anotherItemId', currentContentHash: mockedRemoteItem.local_content_hash }
    ]
    remoteItems = [{ ...mockedRemoteItem }, { ...mockedRemoteItem, id: 'anotherItemId' }]
    savedFiles = ['aFile.zip', 'anotherFile.zip']
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
      }
    ]
  })

  describe('and all of the upsert requests succeed', () => {
    it('should dispatch the update progress action for each uploaded item and the success action with the upserted items and the name of the files of the upserted items', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [call([builderClient, 'upsertItem'], builtFiles[0].item, builtFiles[0].newContent), Promise.resolve(remoteItems[0])],
          [call([builderClient, 'upsertItem'], builtFiles[1].item, builtFiles[1].newContent), Promise.resolve(remoteItems[1])]
        ])
        .put(updateProgressSaveMultipleItems(50))
        .put(updateProgressSaveMultipleItems(100))
        .put(saveMultipleItemsSuccess(items, savedFiles))
        .dispatch(saveMultipleItemsRequest(builtFiles))
        .run({ silenceTimeout: true })
    })
  })

  describe('and one of the upsert requests fails', () => {
    it('should dispatch the update progress action for the non-failing item upload and the failing action with the error, the upserted items and the name of the files of the upserted items', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [call([builderClient, 'upsertItem'], builtFiles[0].item, builtFiles[0].newContent), Promise.resolve(remoteItems[0])],
          [call([builderClient, 'upsertItem'], builtFiles[1].item, builtFiles[1].newContent), Promise.reject(new Error(error))]
        ])
        .put(updateProgressSaveMultipleItems(50))
        .put(saveMultipleItemsFailure(error, [items[0]], [savedFiles[0]]))
        .dispatch(saveMultipleItemsRequest(builtFiles))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the operation gets cancelled', () => {
    it('should dispatch the update progress action for the first non-cancelled upsert and the cancelling action with the upserted items and the name of the files of the upserted items', () => {
      return expectSaga(itemSaga, builderAPI, builderClient)
        .provide([
          [call([builderClient, 'upsertItem'], builtFiles[0].item, builtFiles[0].newContent), Promise.resolve(remoteItems[0])],
          [call([builderClient, 'upsertItem'], builtFiles[1].item, builtFiles[1].newContent), Promise.reject(new Error(error))]
        ])
        .put(updateProgressSaveMultipleItems(50))
        .put(saveMultipleItemsCancelled([items[0]], [savedFiles[0]]))
        .dispatch(saveMultipleItemsRequest(builtFiles))
        .dispatch(cancelSaveMultipleItems())
        .run({ silenceTimeout: true })
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
            bodyShapes: [WearableBodyShape.MALE]
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
        .provide([[select(getLocation), { query: { reviewing: 'true' } }]])
        .dispatch(fetchCollectionItemsRequest(item.collectionId!, 1, paginationData.limit))
        .put(fetchCollectionItemsSuccess(item.collectionId!, [item], paginationData))
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
        .provide([[select(getLocation), { query: { reviewing: 'true' } }]])
        .dispatch(fetchCollectionItemsRequest(item.collectionId!, 1, paginationData.limit))
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
        .provide([[select(getLocation), { query: { reviewing: 'true' } }]])
        .dispatch(fetchCollectionItemsPagesRequest(item.collectionId!, [1], paginationData.limit))
        .put(fetchCollectionItemsPagesSuccess(item.collectionId!, [item]))
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
        .provide([[select(getLocation), { query: { reviewing: 'true' } }]])
        .dispatch(fetchCollectionItemsPagesRequest(item.collectionId!, [1], paginationData.limit))
        .put(fetchCollectionItemsPagesFailure(item.collectionId!, errorMessage))
        .run({ silenceTimeout: true })
    })
  })
})
