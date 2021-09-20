import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { BuilderAPI } from '../../lib/api/builder'
import { saveItemFailure, saveItemRequest, saveItemSuccess, savePublishedItemRequest, savePublishedItemSuccess } from './actions'
import { itemSaga } from './sagas'
import { Item, ItemType } from './types'
import { calculateFinalSize } from './export'
import { MAX_FILE_SIZE } from './utils'
import { call, select } from 'redux-saga/effects'
import { Collection } from 'modules/collection/types'
import { getItems } from './selectors'
import { getCollections } from 'modules/collection/selectors'
import { ChainId, WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'

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
        description: 'valid description'
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .provide([[matchers.call.fn(calculateFinalSize), Promise.resolve(MAX_FILE_SIZE + 1)]])
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
          [matchers.call.fn(calculateFinalSize), Promise.resolve(1)],
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
          [matchers.call.fn(calculateFinalSize), Promise.resolve(1)],
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
          [matchers.call.fn(calculateFinalSize), Promise.resolve(1)],
          [matchers.call.fn(getChainIdByNetwork), ChainId.MATIC_MAINNET]
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
          [matchers.call.fn(calculateFinalSize), Promise.resolve(1)],
          [matchers.call.fn(getChainIdByNetwork), ChainId.MATIC_MAINNET],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .put(savePublishedItemSuccess(newItem, ChainId.MATIC_MAINNET, txHash))
        .dispatch(savePublishedItemRequest(newItem, contents))
        .run({ silenceTimeout: true })
    })
  })
})
