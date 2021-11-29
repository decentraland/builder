import uuidv4 from 'uuid/v4'
import { expectSaga, SagaType } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { call, select, take, race } from 'redux-saga/effects'
import { ChainId, Network, WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import { getCollections, getCollection } from 'modules/collection/selectors'
import { BuilderAPI } from 'lib/api/builder'
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
  publishThirdPartyItemsFailure,
  publishThirdPartyItemsRequest,
  publishThirdPartyItemsSuccess
} from './actions'
import { itemSaga, handleResetItemRequest } from './sagas'
import { Item, ItemType, WearableRepresentation } from './types'
import { calculateFinalSize } from './export'
import { MAX_FILE_SIZE } from './utils'
import { getData as getItemsById, getEntityByItemId, getItems } from './selectors'
import { ThirdParty } from 'modules/thirdParty/types'

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
  describe('and the name contains ":"', () => {
    it('should put a saveItemFailure action with invalid character message', () => {
      const item = {
        name: 'invalid:name'
      } as Item
      return expectSaga(itemSaga, builderAPI)
        .put(saveItemFailure(item, contents, 'Invalid character! The ":" is not allowed in names or descriptions'))
        .dispatch(saveItemRequest(item, contents))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the description contains ":"', () => {
    it('should put a saveItemFailure action with invalid character message', () => {
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

  describe('and file size is larger than 2 MB', () => {
    it('should put a saveItemFailure action with item too big message', () => {
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

  describe('and the collection is locked', () => {
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

  describe('and the name and description don\'t contain ":", the size is below the limit, and the collection is not locked', () => {
    describe('and the item is not published', () => {
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

    describe('and the item is already published', () => {
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

    describe('and the item has not content', () => {
      it('should not calculate the size of the contents', () => {
        const item = {
          name: 'valid name',
          description: 'valid description',
          updatedAt
        } as Item

        return expectSaga(itemSaga, builderAPI)
          .provide([[call([builderAPI, 'saveItem'], item, {}), Promise.resolve()]])
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
        }
      } as Item

      const price = '1000'
      const beneficiary = '0xpepe'

      return expectSaga(itemSaga, builderAPI)
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
          isPublished: false
        } as Item

        const nonExistentItemId = 'non-existent-id'
        const errorMessage = 'Error message'

        return expectSaga(itemSaga, builderAPI)
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

      return expectSaga(itemSaga, builderAPI)
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

  describe('and the collection is locked', () => {
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

  describe('and a saveItemFailure action happens after the save item request', () => {
    it('should put a resetItemFailure action with the saveItemFailure action action message', () => {
      const saveItemFailureMessage = 'saveItemFailure action message'

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
        .silentRun()
    })
  })
})

describe('when publishing third party items', () => {
  describe('and the transaction is sent correctly', () => {
    let collection: Collection
    let items: Item[]
    let thirdParty: ThirdParty
    let txHash: string

    beforeEach(() => {
      collection = {
        id: 'aCollection',
        name: 'collection name'
      } as Collection

      items = [
        {
          id: 'anItem',
          name: 'valid name',
          description: 'valid description',
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection-id:token-id',
          collectionId: collection.id,
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
          }
        }
      ] as Item[]

      thirdParty = {
        id: 'aCollection',
        name: 'tp name'
      } as ThirdParty

      txHash = '0xdeadbeef'
    })

    it('should put a publish thrid party items success action and go to activity', () => {
      return expectSaga(itemSaga, builderAPI)
        .provide([
          [select(getCollection, collection.id), collection],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .put(publishThirdPartyItemsSuccess(txHash, ChainId.MATIC_MUMBAI, thirdParty, collection, items))
        .dispatch(publishThirdPartyItemsRequest(thirdParty, items))
        .run({ silenceTimeout: true })
    })

    describe('and sending the transaction fails', () => {
      let collection: Collection
      let items: Item[]
      let thirdParty: ThirdParty
      let errorMessage: string

      beforeEach(() => {
        collection = { id: 'aCollection' } as Collection
        items = [{ collectionId: collection.id }] as Item[]
        thirdParty = { id: 'aCollection' } as ThirdParty
        errorMessage = 'Rejected trasaction'
      })

      it('should put a publish third party failure action', () => {
        return expectSaga(itemSaga, builderAPI)
          .provide([
            [select(getCollection, collection.id), collection],
            [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
            [matchers.call.fn(sendTransaction), Promise.reject(new Error(errorMessage))]
          ])
          .put(publishThirdPartyItemsFailure(thirdParty, items, errorMessage))
          .dispatch(publishThirdPartyItemsRequest(thirdParty, items))
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

      return expectSaga(itemSaga, builderAPI)
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
