import uuidv4 from 'uuid/v4'
import { expectSaga, SagaType } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { call, select, take, race } from 'redux-saga/effects'
import { ChainId, Network, WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getCollections, getCollection } from 'modules/collection/selectors'
import { BuilderAPI } from 'lib/api/builder'
import {
  resetItemFailure,
  resetItemRequest,
  resetItemSuccess,
  saveItemFailure,
  saveItemRequest,
  saveItemSuccess,
  savePublishedItemRequest,
  savePublishedItemSuccess,
  SAVE_ITEM_FAILURE,
  SAVE_ITEM_SUCCESS
} from './actions'
import { itemSaga, handleResetItemRequest } from './sagas'
import { Item, ItemType } from './types'
import { calculateFinalSize } from './export'
import { MAX_FILE_SIZE } from './utils'
import { Collection } from 'modules/collection/types'
import { getData as getItemsById, getEntityByItemId, getItems } from './selectors'

let blob: Blob = new Blob()
const contents: Record<string, Blob> = { path: blob }

const builderAPI = ({
  saveItem: jest.fn(),
  saveItemContents: jest.fn()
} as unknown) as BuilderAPI

let dateNowSpy: jest.SpyInstance
const updatedAt = Date.now()

beforeEach(() => {
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => updatedAt)
})

afterEach(() => {
  dateNowSpy.mockRestore()
})

describe('when handling the save item request action', () => {
  describe('when name contains ":"', () => {
    it('should put a save item failure with invalid character message', () => {
      const item = {
        name: 'invalid:name'
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('when description contains ":"', () => {
    it('should put a save item failure with invalid character message', () => {
      const item = {
        name: 'valid name',
        description: 'invalid:description'
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('when file size is larger than 2 MB', () => {
    it('should put a save item failure with item too big message', () => {
      const item = {
        name: 'valid name',
        description: 'valid description',
        updatedAt
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .provide([[call(calculateFinalSize, item, contents), Promise.resolve(MAX_FILE_SIZE + 1)]])
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

  describe('when all correct conditions are met', () => {
    it('should put a save item success action', () => {
      const item = {
        name: 'valid name',
        description: 'valid description',
        updatedAt
      } as Item

      return expectSaga(itemSaga, builderAPI)
        .provide([
          [call(calculateFinalSize, item, contents), Promise.resolve(1)],
          [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
        ])
        .put(saveItemSuccess(item, contents))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the collection is locked', () => {
    let collection: Collection
    let item: Item
    let lock: number

    beforeEach(() => {
      lock = Date.now()
      collection = { id: uuidv4(), name: 'valid name', lock } as Collection
      item = {
        name: 'valid name',
        description: 'valid description',
        collectionId: collection.id
      } as Item

      jest.spyOn(Date, 'now').mockReturnValueOnce(lock)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should dispatch the saveItemFailure signaling that the item is locked and not save the item', () => {
      return expectSaga(itemSaga, builderAPI)
        .provide([
          [select(getCollection, collection.id), collection],
          [call(calculateFinalSize, item, contents), Promise.resolve(1)]
        ])
        .put(saveItemFailure(item, contents, 'The collection is locked'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('when correct conditions are met and item is already published', () => {
    it('should save item if it is already published', () => {
      const item = {
        name: 'valid name',
        description: 'valid description',
        updatedAt,
        isPublished: true
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .provide([
          [call(calculateFinalSize, item, contents), Promise.resolve(1)],
          [call([builderAPI, 'saveItem'], item, contents), Promise.resolve()]
        ])
        .put(saveItemSuccess(item, contents))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the save published item request action', () => {
  describe('when all correct conditions are met', () => {
    it('should put a save published item success action', () => {
      const collection = {
        id: 'aCollection'
      } as Collection

      const item = {
        id: 'anItem',
        name: 'valid name',
        description: 'valid description',
        collectionId: collection.id,
        updatedAt,
        isPublished: true
      } as Item

      return expectSaga(itemSaga, builderAPI)
        .provide([
          [select(getItems), [item]],
          [select(getCollections), [collection]],
          [call(calculateFinalSize, item, contents), Promise.resolve(1)],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET]
        ])
        .put(saveItemRequest(item, contents))
        .put(savePublishedItemSuccess(item, ChainId.MATIC_MAINNET))
        .dispatch(savePublishedItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('when price or beneficiary are changed', () => {
    it('should put a save published item success with the tx hash', () => {
      const collection = {
        id: 'aCollection'
      } as Collection

      const item = ({
        id: 'anItem',
        name: 'valid name',
        description: 'valid description',
        collectionId: collection.id,
        type: ItemType.WEARABLE,
        updatedAt,
        isPublished: true,
        price: '1',
        beneficiary: '0xA',
        data: {
          category: WearableCategory.HAT,
          representations: [
            {
              bodyShapes: [WearableBodyShape.MALE, WearableBodyShape.FEMALE]
            }
          ]
        }
      } as any) as Item

      const newItem = {
        ...item,
        price: '2',
        beneficiary: '0xB'
      } as Item

      const txHash = '0xdeabeef'

      return expectSaga(itemSaga, builderAPI)
        .provide([
          [select(getItems), [item]],
          [select(getCollections), [collection]],
          [call(calculateFinalSize, item, contents), Promise.resolve(1)],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .put(savePublishedItemSuccess(newItem, ChainId.MATIC_MAINNET, txHash))
        .dispatch(savePublishedItemRequest(newItem, contents))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when reseting an item to the state found in the catalyst', () => {
  const originalFetch = window.fetch

  window.fetch = jest.fn().mockResolvedValue({
    blob: () => Promise.resolve(blob)
  })

  const itemId = 'itemId'

  let itemsById: any
  let entitiesByItemId: any
  let replacedItem: any
  let replacedContents: any

  beforeEach(() => {
    itemsById = {
      [itemId]: {
        name: 'changed name',
        description: 'changed description',
        contents: { ['changed key']: 'changed hash' },
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
        content: [{ key: 'key', hash: 'hash' }],
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
      contents: { key: 'hash' },
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

    replacedContents = { key: blob }
  })

  afterAll(() => {
    window.fetch = originalFetch
  })

  describe('when the correct conditions are met', () => {
    it('should put a reset item success action', () => {
      return expectSaga(handleResetItemRequest as SagaType, resetItemRequest(itemId))
        .provide([
          [select(getItemsById), itemsById],
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
        .silentRun()
    })
  })

  describe('when the collection is locked', () => {
    let collection: Collection
    let item: Item
    let lock: number

    beforeEach(() => {
      lock = Date.now()
      collection = { id: uuidv4(), name: 'valid name', lock } as Collection
      item = {
        name: 'valid name',
        description: 'valid description',
        collectionId: collection.id
      } as Item

      jest.spyOn(Date, 'now').mockReturnValueOnce(lock)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should dispatch the saveItemFailure signaling that the item is locked and not save the item', () => {
      return expectSaga(itemSaga, builderAPI)
        .provide([
          [select(getCollection, collection.id), collection],
          [call(calculateFinalSize, item, contents), Promise.resolve(1)]
        ])
        .put(saveItemFailure(item, contents, 'The collection is locked'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('when a save item failure action happens after the save item request', () => {
    it('should put a reset item failure action with the save item failure action message', () => {
      const saveItemFailureMessage = 'save item failure message'

      return expectSaga(handleResetItemRequest as SagaType, resetItemRequest(itemId))
        .provide([
          [select(getItemsById), itemsById],
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
        .silentRun()
    })
  })

  describe('when the entity has no content', () => {
    it('should put a reset item failure action with a content missing message', () => {
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
        .silentRun()
    })
  })
})
