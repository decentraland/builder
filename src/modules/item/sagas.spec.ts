import { expectSaga, SagaType } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { call, select, take, race } from 'redux-saga/effects'
import { ChainId, Network, WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getCollections } from 'modules/collection/selectors'
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

describe('Item sagas', () => {
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
    it('should throw if name contains ":"', () => {
      const item = {
        name: 'invalid:name'
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })

    it('should throw if description contains ":"', () => {
      const item = {
        name: 'valid name',
        description: 'invalid:description'
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })

    it('should throw if description contains ":"', () => {
      const item = {
        name: 'valid name',
        description: 'invalid:description'
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })

    it('should throw if file size is larger than 2 MB', () => {
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

    it('should save item and dispatch success action', () => {
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

  describe('when handling the save published item request action', () => {
    it('should save item in the server', () => {
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

    it('should send a transaction if price or beneficiary changed', () => {
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

    it('should succeed when all correct conditions are met', () => {
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

    it('should fail when save item saga fails', () => {
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

    it('should fail when entity has no content', () => {
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
        .put(resetItemFailure(itemId, "Entity does not have content"))
        .silentRun()
    })
  })
})
