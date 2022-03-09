import uuidv4 from 'uuid/v4'
import { call } from '@redux-saga/core/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import { select } from 'redux-saga-test-plan/matchers'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, Network } from '@dcl/schemas'
import { AuthIdentity } from 'dcl-crypto'
import { Provider, Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { closeModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { ContractName, getContract } from 'decentraland-transactions'
import { loginSuccess } from 'modules/identity/actions'
import { BuilderAPI } from 'lib/api/builder'
import { ThirdParty } from './types'
import {
  fetchThirdPartiesRequest,
  fetchThirdPartiesFailure,
  fetchThirdPartiesSuccess,
  fetchThirdPartyItemSlotPriceFailure,
  fetchThirdPartyItemSlotPriceRequest,
  fetchThirdPartyItemSlotPriceSuccess,
  buyThirdPartyItemSlotFailure,
  buyThirdPartyItemSlotRequest,
  buyThirdPartyItemSlotSuccess,
  fetchThirdPartyAvailableSlotsFailure,
  fetchThirdPartyAvailableSlotsRequest,
  fetchThirdPartyAvailableSlotsSuccess,
  publishThirdPartyItemsRequest,
  publishThirdPartyItemsFailure,
  publishThirdPartyItemsSuccess,
  pushChangesThirdPartyItemsFailure,
  pushChangesThirdPartyItemsRequest,
  pushChangesThirdPartyItemsSuccess,
  publishAndPushChangesThirdPartyItemsRequest
} from './actions'
import { mockedItem } from 'specs/item'
import { getCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { CurationStatus } from 'modules/curations/types'
import { getItemCurations } from 'modules/curations/itemCuration/selectors'
import { Item } from 'modules/item/types'
import { thirdPartySaga, getContractInstance, getPublishItemsSignature } from './sagas'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getItemSlotPrice } from './selectors'

const mockBuilder = ({
  fetchThirdParties: jest.fn(),
  fetchThirdPartyAvailableSlots: jest.fn(),
  publishCollection: jest.fn(),
  pushItemCuration: jest.fn(),
  updateItemCurationStatus: jest.fn()
} as any) as BuilderAPI

let thirdParty: ThirdParty
const defaultError = 'error'
const txHash = 'mockedHash'
const mockedSlotsToBuy = 10

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

describe('when handling the request to fetch the third party item slot price', () => {
  describe('and the request fails', () => {
    it('should put the action signaling the fetching error with the error message', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_MUMBAI), Promise.reject(new Error(defaultError))]
        ])
        .put(fetchThirdPartyItemSlotPriceFailure(defaultError))
        .dispatch(fetchThirdPartyItemSlotPriceRequest())
        .run({ silenceTimeout: true })
    })
  })

  describe('and the request succeeds', () => {
    let mockedSlotPrice: BigNumber
    let mockedOracleRate: BigNumber
    let mockedTPContract: { itemSlotPrice: () => BigNumber }
    let mockedOracleContract: { getRate: () => BigNumber }

    beforeEach(() => {
      mockedSlotPrice = BigNumber.from('1000000000000000000')
      mockedOracleRate = BigNumber.from('1000000000000000000')
      mockedTPContract = {
        itemSlotPrice: () => mockedSlotPrice
      }
      mockedOracleContract = {
        getRate: () => mockedOracleRate
      }
    })
    it('should put the action signaling the successful fetch with the retrieved item slot price', () => {
      const mockedProvider = {}
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [call(getNetworkProvider, ChainId.MATIC_MUMBAI), mockedProvider],
          [
            call(getContractInstance, ContractName.ThirdPartyRegistry, ChainId.MATIC_MUMBAI, (mockedProvider as unknown) as Provider),
            mockedTPContract
          ],
          [
            call(getContractInstance, ContractName.ChainlinkOracle, ChainId.MATIC_MUMBAI, (mockedProvider as unknown) as Provider),
            mockedOracleContract
          ]
        ])
        .put(fetchThirdPartyItemSlotPriceSuccess(Number(mockedSlotPrice.div(mockedOracleRate))))
        .dispatch(fetchThirdPartyItemSlotPriceRequest())
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the request to buy third party item slots', () => {
  const mockedSlotPriceInMANA = 10
  describe("and the chain id couldn't be retrieved", () => {
    it('should put the action signaling the failure of the purchase of item slots with third party id', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([[call(getChainIdByNetwork, Network.MATIC), Promise.reject(new Error(defaultError))]])
        .put(buyThirdPartyItemSlotFailure(thirdParty.id, 10, defaultError))
        .dispatch(buyThirdPartyItemSlotRequest(thirdParty, 10, 10))
        .run({ silenceTimeout: true })
    })
  })

  describe('and sending the transaction fails', () => {
    it('should put the action signaling the failure of the purchase of item slots with the slot amount and the third party id', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [select(getItemSlotPrice), mockedSlotPriceInMANA],
          [matchers.call.fn(sendTransaction), Promise.reject(new Error(defaultError))]
        ])
        .dispatch(buyThirdPartyItemSlotRequest(thirdParty, mockedSlotsToBuy, mockedSlotPriceInMANA))
        .put(buyThirdPartyItemSlotFailure(thirdParty.id, mockedSlotPriceInMANA, defaultError))
        .run({ silenceTimeout: true })
    })
  })

  describe('and sending the transaction succeeds', () => {
    it('should put the action signaling the successful purchase of item slots with the slot amount, the third party and the transaction details', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [select(getItemSlotPrice), mockedSlotPriceInMANA],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .put(buyThirdPartyItemSlotSuccess(txHash, ChainId.MATIC_MUMBAI, thirdParty, mockedSlotsToBuy))
        .dispatch(buyThirdPartyItemSlotRequest(thirdParty, mockedSlotsToBuy, mockedSlotPriceInMANA))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the successful purchase of a third party item slot', () => {
  it('should put the action to close the modal to buy the item slots', () => {
    return expectSaga(thirdPartySaga, mockBuilder)
      .put(closeModal('BuyItemSlotsModal'))
      .dispatch(buyThirdPartyItemSlotSuccess('aTxHash', ChainId.ETHEREUM_GOERLI, thirdParty, 10))
      .run({ silenceTimeout: true })
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
  beforeEach(() => {
    collection = { name: 'valid collection name' } as Collection
  })
  describe('when the api request fails', () => {
    let errorMessage: string

    beforeEach(() => {
      errorMessage = 'Some Error Message'
    })

    it('should put the publish third party items fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [select(getCollection, mockedItem.collectionId), collection],
          [call(getPublishItemsSignature, thirdParty.id, 1), { signature: '', signedMessage: '', salt: '' }],
          [matchers.call.fn(mockBuilder.publishTPCollection), throwError(new Error(errorMessage))]
        ])
        .put(publishThirdPartyItemsFailure(errorMessage))
        .dispatch(publishThirdPartyItemsRequest(thirdParty, [mockedItem]))
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
          updatedAt: 0
        }
      ]
    })

    it('should put the fetch third party success action the response with the new itemCurations and close the PublishThirdPartyCollectionModal modal', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [select(getCollection, mockedItem.collectionId), collection],
          [call(getPublishItemsSignature, thirdParty.id, 1), { signature: '', signedMessage: '', salt: '' }],
          [matchers.call.fn(mockBuilder.publishTPCollection), { items: [], itemCurations }]
        ])
        .put(publishThirdPartyItemsSuccess(mockedItem.collectionId!, [], itemCurations))
        .put(closeModal('PublishThirdPartyCollectionModal'))
        .dispatch(publishThirdPartyItemsRequest(thirdParty, [mockedItem]))
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
    let errorMessage: string

    beforeEach(() => {
      errorMessage = 'Some Error Message'
      itemCurations = [
        {
          id: 'id',
          itemId: mockedItem.id,
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0
        }
      ]
    })

    it('should put the push changes third party items fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [select(getItemCurations, item.collectionId), itemCurations],
          [matchers.call.fn(mockBuilder.updateItemCurationStatus), throwError(new Error(errorMessage))]
        ])
        .put(pushChangesThirdPartyItemsFailure(errorMessage))
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
          updatedAt: 0
        },
        {
          id: 'id',
          itemId: 'anotherItemId',
          createdAt: 0,
          status: CurationStatus.APPROVED,
          updatedAt: 0
        }
      ]
      updatedItemCurations = [
        {
          id: 'id',
          itemId: mockedItem.id,
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0
        },
        {
          id: 'id',
          itemId: 'anotherItemId',
          createdAt: 0,
          status: CurationStatus.PENDING,
          updatedAt: 0
        }
      ]
    })

    it('should put the fetch third party success action the response with the new itemCurations and close the PublishThirdPartyCollectionModal modal', () => {
      return expectSaga(thirdPartySaga, mockBuilder)
        .provide([
          [select(getItemCurations, item.collectionId), itemCurations],
          [matchers.call.fn(mockBuilder.updateItemCurationStatus), updatedItemCurations[0]],
          [matchers.call.fn(mockBuilder.pushItemCuration), updatedItemCurations[1]]
        ])
        .put(pushChangesThirdPartyItemsSuccess(item.collectionId!, updatedItemCurations))
        .put(closeModal('PublishThirdPartyCollectionModal'))
        .dispatch(pushChangesThirdPartyItemsRequest([item, { ...mockedItem, id: 'anotherItemId' }]))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when publishing & pushing changes to third party items', () => {
  let collection: Collection
  let item: Item
  beforeEach(() => {
    collection = { name: 'valid collection name', id: uuidv4() } as Collection
    item = {
      ...mockedItem,
      collectionId: collection.id
    }
  })

  it('should put both publishThirdPartyItemsRequest and pushChangesThirdPartyItemsRequest actions', () => {
    const itemsToPublish = [item]
    const itemsToPushChanges = [mockedItem]
    return expectSaga(thirdPartySaga, mockBuilder)
      .put(publishThirdPartyItemsRequest(thirdParty, itemsToPublish))
      .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, itemsToPublish, itemsToPushChanges))
      .run({ silenceTimeout: true })
  })
})
