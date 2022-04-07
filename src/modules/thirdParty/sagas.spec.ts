import uuidv4 from 'uuid/v4'
import { call } from '@redux-saga/core/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import { select } from 'redux-saga-test-plan/matchers'
import { AuthIdentity } from 'dcl-crypto'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { loginSuccess } from 'modules/identity/actions'
import { BuilderAPI } from 'lib/api/builder'
import { ThirdParty } from './types'
import {
  fetchThirdPartiesRequest,
  fetchThirdPartiesFailure,
  fetchThirdPartiesSuccess,
  fetchThirdPartyAvailableSlotsFailure,
  fetchThirdPartyAvailableSlotsRequest,
  fetchThirdPartyAvailableSlotsSuccess,
  publishThirdPartyItemsRequest,
  publishThirdPartyItemsFailure,
  publishThirdPartyItemsSuccess,
  pushChangesThirdPartyItemsFailure,
  pushChangesThirdPartyItemsRequest,
  pushChangesThirdPartyItemsSuccess,
  publishAndPushChangesThirdPartyItemsRequest,
  publishAndPushChangesThirdPartyItemsFailure,
  publishAndPushChangesThirdPartyItemsSuccess
} from './actions'
import { mockedItem } from 'specs/item'
import { getCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { CurationStatus } from 'modules/curations/types'
import { getItemCurations } from 'modules/curations/itemCuration/selectors'
import { Item } from 'modules/item/types'
import { thirdPartySaga } from './sagas'
import { getPublishItemsSignature } from './utils'

const mockBuilder = ({
  fetchThirdParties: jest.fn(),
  fetchThirdPartyAvailableSlots: jest.fn(),
  publishTPCollection: jest.fn(),
  pushItemCuration: jest.fn(),
  updateItemCurationStatus: jest.fn()
} as any) as BuilderAPI

let thirdParty: ThirdParty

beforeEach(() => {
  thirdParty = {
    id: '1',
    name: 'test',
    description: 'aDescription',
    managers: [],
    maxItems: '1',
    totalItems: '1'
  }
})

describe('when the login action succeeds', () => {
  let wallet: Wallet
  let identity: AuthIdentity

  beforeEach(() => {
    wallet = { address: '0x123' } as Wallet
    identity = {} as AuthIdentity
  })

  it('should put the fetch third party request action', () => {
    return expectSaga(thirdPartySaga, mockBuilder)
      .put(fetchThirdPartiesRequest(wallet.address))
      .dispatch(loginSuccess(wallet, identity))
      .run({ silenceTimeout: true })
  })
})

describe('when fetching third parties', () => {
  describe('when the api request fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'Some Error Message'
    })

    it('should put the fetch third party fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([[matchers.call.fn(mockBuilder.fetchThirdParties), throwError(new Error(errorMessage))]])
        .put(fetchThirdPartiesFailure(errorMessage))
        .dispatch(fetchThirdPartiesRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    let thirdParties: ThirdParty[]

    beforeEach(() => {
      thirdParties = [
        {
          id: '1',
          name: 'a third party',
          description: 'some desc',
          managers: ['0x1', '0x2'],
          maxItems: '0',
          totalItems: '0'
        },
        { id: '2', name: 'a third party', description: 'some desc', managers: ['0x3'], maxItems: '0', totalItems: '0' }
      ]
    })

    describe('when an address is supplied in the action payload', () => {
      let address: string

      beforeEach(() => {
        address = '0x1'
      })

      it('should pass the address to the api and put the fetch third party success action the response', () => {
        return expectSaga(thirdPartySaga, mockBuilder)
          .provide([[call([mockBuilder, 'fetchThirdParties'], address), thirdParties]])
          .put(fetchThirdPartiesSuccess(thirdParties))
          .dispatch(fetchThirdPartiesRequest(address))
          .run({ silenceTimeout: true })
      })
    })

    describe('when no address is supplied', () => {
      it('should put the fetch third party success action with the api response', () => {
        return expectSaga(thirdPartySaga, mockBuilder)
          .provide([[matchers.call.fn(mockBuilder.fetchThirdParties), thirdParties]])
          .put(fetchThirdPartiesSuccess(thirdParties))
          .dispatch(fetchThirdPartiesRequest())
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when fetching third party available slots', () => {
  describe('when the api request fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'Some Error Message'
    })

    it('should put the fetch third party available slots fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([[matchers.call.fn(mockBuilder.fetchThirdPartyAvailableSlots), throwError(new Error(errorMessage))]])
        .put(fetchThirdPartyAvailableSlotsFailure(errorMessage))
        .dispatch(fetchThirdPartyAvailableSlotsRequest(thirdParty.id))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch third party success action the response', () => {
      const mockedAvaibleSlots = 20
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([[call([mockBuilder, 'fetchThirdPartyAvailableSlots'], thirdParty.id), mockedAvaibleSlots]])
        .put(fetchThirdPartyAvailableSlotsSuccess(thirdParty.id, mockedAvaibleSlots))
        .dispatch(fetchThirdPartyAvailableSlotsRequest(thirdParty.id))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when publishing third party items', () => {
  let collection: Collection
  let item: Item
  let signature: string
  let salt: string
  let qty: number
  beforeEach(() => {
    collection = { name: 'valid collection name' } as Collection
    item = { ...mockedItem, collectionId: 'a valid collectionId' }
    signature = 'a signature'
    salt = '0xsalt'
    qty = 1
  })

  describe('when the api request fails', () => {
    let errorMessage: string

    beforeEach(() => {
      errorMessage = 'Some Error Message'
    })

    it('should put the publish third party items fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [select(getCollection, item.collectionId), collection],
          [call(getPublishItemsSignature, thirdParty.id, 1), { signature, salt }],
          [
            call([mockBuilder, mockBuilder.publishTPCollection], item.collectionId!, [item.id], { signature, qty, salt }),
            throwError(new Error(errorMessage))
          ]
        ])
        .put(publishThirdPartyItemsFailure(errorMessage))
        .dispatch(publishThirdPartyItemsRequest(thirdParty, [item]))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    let itemCurations: ItemCuration[]
    beforeEach(() => {
      collection = { name: 'valid collection name', id: uuidv4() } as Collection
      itemCurations = [
        {
          id: 'id',
          itemId: 'itemId',
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0,
          contentHash: 'aHash'
        }
      ]
    })

    it('should put the fetch third party success action with the new itemCurations and close the PublishThirdPartyCollectionModal modal', () => {
      const mockedItemReturnedByServer = { ...mockedItem, id: 'a new id' }
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [select(getCollection, item.collectionId), collection],
          [call(getPublishItemsSignature, thirdParty.id, 1), { signature, salt }],
          [
            call([mockBuilder, mockBuilder.publishTPCollection], item.collectionId!, [item.id], { signature, qty, salt }),
            { collection, items: [mockedItemReturnedByServer], itemCurations }
          ]
        ])
        .put(publishThirdPartyItemsSuccess(thirdParty.id, item.collectionId!, [mockedItemReturnedByServer], itemCurations))
        .put(closeModal('PublishThirdPartyCollectionModal'))
        .dispatch(publishThirdPartyItemsRequest(thirdParty, [item]))
        .run({ silenceTimeout: true })
    })

    it('should put the fetch available slots action when the push finishes successfully', () => {
      const mockedItemReturnedByServer = { ...mockedItem, id: 'a new id' }
      return expectSaga(thirdPartySaga, mockBuilder)
        .put(fetchThirdPartyAvailableSlotsRequest(thirdParty.id))
        .dispatch(publishThirdPartyItemsSuccess(thirdParty.id, item.collectionId!, [mockedItemReturnedByServer], itemCurations))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when pushing changes to third party items', () => {
  let collection: Collection
  let item: Item
  let itemCurations: ItemCuration[]
  beforeEach(() => {
    collection = { name: 'valid collection name', id: uuidv4() } as Collection
    item = {
      ...mockedItem,
      collectionId: collection.id
    }
  })

  describe('when one of the api requests fails', () => {
    beforeEach(() => {
      itemCurations = [
        {
          id: 'id',
          itemId: mockedItem.id,
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0,
          contentHash: 'aHash'
        }
      ]
    })

    it('should put the push changes third party items fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [select(getItemCurations, item.collectionId), itemCurations],
          [call([mockBuilder, mockBuilder.updateItemCurationStatus], item.id, itemCurations[0].status), throwError(new Error('Error'))]
        ])
        .put(pushChangesThirdPartyItemsFailure('Some item curations were not pushed'))
        .dispatch(pushChangesThirdPartyItemsRequest([item]))
        .run({ silenceTimeout: true })
    })
  })

  describe('when both api requests succeed', () => {
    let updatedItemCurations: ItemCuration[]
    beforeEach(() => {
      collection = { name: 'valid collection name', id: uuidv4() } as Collection
      itemCurations = [
        {
          id: 'id',
          itemId: mockedItem.id,
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0,
          contentHash: 'aHash'
        },
        {
          id: 'id',
          itemId: 'anotherItemId',
          createdAt: 0,
          status: CurationStatus.APPROVED,
          updatedAt: 0,
          contentHash: 'anotherHash'
        }
      ]
      updatedItemCurations = [
        {
          id: 'id',
          itemId: mockedItem.id,
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0,
          contentHash: 'aHash'
        },
        {
          id: 'id',
          itemId: 'anotherItemId',
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0,
          contentHash: 'anotherHash'
        }
      ]
      ;(mockBuilder.updateItemCurationStatus as jest.Mock).mockResolvedValue(updatedItemCurations[0])
      ;(mockBuilder.pushItemCuration as jest.Mock).mockResolvedValue(updatedItemCurations[1])
    })

    it('should put the push changes success action with the updated item curations and close the PublishThirdPartyCollectionModal modal', () => {
      const anotherItem = { ...mockedItem, id: 'anotherItemId' }
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([[select(getItemCurations, item.collectionId), itemCurations]])
        .put(pushChangesThirdPartyItemsSuccess(item.collectionId!, updatedItemCurations))
        .put(closeModal('PublishThirdPartyCollectionModal'))
        .dispatch(pushChangesThirdPartyItemsRequest([item, anotherItem]))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when publishing & pushing changes to third party items', () => {
  let collection: Collection
  let item: Item
  let itemWithChanges: Item
  let errorMessage: string
  let itemCurations: ItemCuration[]
  let publishResponse: Item[]
  let itemsToPublish: Item[]
  let signature: string
  let salt: string
  let qty: number
  beforeEach(() => {
    collection = { name: 'valid collection name', id: uuidv4() } as Collection
    item = {
      ...mockedItem,
      collectionId: collection.id
    }
    itemWithChanges = {
      ...mockedItem,
      id: uuidv4(),
      collectionId: collection.id
    }
    errorMessage = 'Some Error Message'
    itemCurations = [
      {
        id: 'id',
        itemId: mockedItem.id,
        createdAt: 0,
        status: CurationStatus.PENDING,
        updatedAt: 0,
        contentHash: 'aHash'
      }
    ]
    publishResponse = [{ ...item, id: uuidv4() }]
    itemsToPublish = [item]
    signature = 'a signature'
    salt = '0xsalt'
    qty = 1
  })

  describe('when the publish items fails', () => {
    it('should put the publish & push changes failure action', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getPublishItemsSignature, thirdParty.id, 1), { signature, salt }],
          [
            call([mockBuilder, mockBuilder.publishTPCollection], item.collectionId!, [item.id], { signature, qty, salt }),
            throwError(new Error(errorMessage))
          ]
        ])
        .put(publishAndPushChangesThirdPartyItemsFailure(errorMessage))
        .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, [item], [mockedItem]))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the publish works fine but push items fails', () => {
    beforeEach(() => {
      ;(mockBuilder.publishTPCollection as jest.Mock).mockResolvedValue({ items: publishResponse, itemCurations })
      ;(mockBuilder.pushItemCuration as jest.Mock).mockRejectedValue(new Error(errorMessage))
    })
    it('should put the publish & push changes failure action', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getPublishItemsSignature, thirdParty.id, 1), { signature, salt }],
          [select(getItemCurations, item.collectionId), itemCurations]
        ])
        .put(publishAndPushChangesThirdPartyItemsFailure(errorMessage))
        .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, itemsToPublish, [itemWithChanges]))
        .run({ silenceTimeout: true })
    })
  })

  describe('when both publish and push changes work fine', () => {
    let updatedItemCurations: ItemCuration[]
    beforeEach(() => {
      updatedItemCurations = [
        {
          id: 'id',
          itemId: mockedItem.id,
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0,
          contentHash: 'aHash'
        }
      ]
      ;(mockBuilder.publishTPCollection as jest.Mock).mockResolvedValue({ items: publishResponse, itemCurations })
      ;(mockBuilder.pushItemCuration as jest.Mock).mockResolvedValue(updatedItemCurations[0])
    })

    it('should put the publish & push changes success action and the fetch available slots request', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getPublishItemsSignature, thirdParty.id, 1), { signature, salt }],
          [select(getItemCurations, item.collectionId), itemCurations]
        ])
        .put(publishAndPushChangesThirdPartyItemsSuccess(item.collectionId!, publishResponse, [...itemCurations, updatedItemCurations[0]]))
        .put(fetchThirdPartyAvailableSlotsRequest(thirdParty.id))
        .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, itemsToPublish, [itemWithChanges]))
        .run({ silenceTimeout: true })
    })
  })
})
