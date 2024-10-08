import uuidv4 from 'uuid/v4'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { ChainId, Network } from '@dcl/schemas'
import { MerkleDistributorInfo } from '@dcl/content-hash-tree/dist/types'
import { CatalystClient } from 'dcl-catalyst-client'
import { DeploymentPreparationData } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { call } from '@redux-saga/core/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import { select, take } from 'redux-saga-test-plan/matchers'
import { AuthIdentity, Authenticator, AuthLinkType } from '@dcl/crypto'
import { ToastType } from 'decentraland-ui'
import { SHOW_TOAST } from 'decentraland-dapps/dist/modules/toast/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { closeModal, openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { loginSuccess } from 'modules/identity/actions'
import { BuilderAPI, TermsOfServiceEvent } from 'lib/api/builder'
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
  deployBatchedThirdPartyItemsRequest,
  deployBatchedThirdPartyItemsFailure,
  deployBatchedThirdPartyItemsSuccess,
  disableThirdPartyFailure,
  disableThirdPartyRequest,
  disableThirdPartySuccess,
  fetchThirdPartyFailure,
  fetchThirdPartyRequest,
  fetchThirdPartySuccess,
  finishPublishAndPushChangesThirdPartyItemsSuccess,
  finishPublishAndPushChangesThirdPartyItemsFailure,
  publishAndPushChangesThirdPartyItemsSuccess,
  clearThirdPartyErrors,
  setThirdPartyKindSuccess,
  setThirdPartyKindRequest,
  setThirdPartyKindFailure
} from './actions'
import { mockedItem } from 'specs/item'
import { getCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { CurationStatus } from 'modules/curations/types'
import { getIdentity } from 'modules/identity/utils'
import { buildTPItemEntity } from 'modules/item/export'
import { getItemCurations } from 'modules/curations/itemCuration/selectors'
import {
  ThirdPartyBuildEntityError,
  ThirdPartyCurationUpdateError,
  ThirdPartyDeploymentError,
  ThirdPartyError
} from 'modules/collection/utils'
import { updateThirdPartyActionProgress } from 'modules/ui/thirdparty/action'
import { FETCH_COLLECTION_SUCCESS, fetchCollectionRequest } from 'modules/collection/actions'
import { PublishThirdPartyCollectionModalStep, ThirdPartyAction } from 'modules/ui/thirdparty/types'
import { Item } from 'modules/item/types'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import { thirdPartySaga } from './sagas'
import { convertThirdPartyMetadataToRawMetadata, getPublishItemsSignature } from './utils'
import { getThirdParty } from './selectors'
import { getIsLinkedWearablesPaymentsEnabled } from 'modules/features/selectors'
import { subscribeToNewsletterRequest } from 'modules/newsletter/action'
import { waitForTx } from 'modules/transaction/utils'
import { retry } from 'redux-saga/effects'

jest.mock('modules/item/export')
jest.mock('@dcl/crypto')

const mockBuilder = {
  fetchThirdParties: jest.fn(),
  fetchThirdParty: jest.fn(),
  fetchThirdPartyAvailableSlots: jest.fn(),
  publishTPCollection: jest.fn(),
  pushItemCuration: jest.fn(),
  updateItemCurationStatus: jest.fn(),
  deleteVirtualThirdParty: jest.fn(),
  fetchContents: jest.fn(),
  setThirdPartyKind: jest.fn(),
  saveTOS: jest.fn()
} as any as BuilderAPI

const deployMock = jest.fn()
let mockCatalystClient: CatalystClient

let thirdParty: ThirdParty

beforeEach(() => {
  mockCatalystClient = {
    getContentClient: jest.fn().mockResolvedValue({
      deploy: deployMock
    })
  } as unknown as CatalystClient
  thirdParty = {
    id: '1',
    name: 'test',
    root: '',
    isApproved: true,
    description: 'aDescription',
    managers: ['0x1'],
    contracts: [],
    maxItems: '1',
    totalItems: '1',
    published: false,
    isProgrammatic: false,
    availableSlots: 200
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
    return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
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
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
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
          root: '',
          isApproved: true,
          description: 'some desc',
          managers: ['0x1', '0x2'],
          maxItems: '0',
          totalItems: '0',
          contracts: [],
          published: false,
          isProgrammatic: false
        },
        {
          id: '2',
          name: 'a third party',
          description: 'some desc',
          managers: ['0x3'],
          maxItems: '0',
          totalItems: '0',
          contracts: [],
          root: '',
          isApproved: true,
          published: false,
          isProgrammatic: false
        }
      ]
    })

    describe('when an address is supplied in the action payload', () => {
      let address: string

      beforeEach(() => {
        address = '0x1'
      })

      it('should pass the address to the api and put the fetch third party success action the response', () => {
        return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
          .provide([[call([mockBuilder, 'fetchThirdParties'], address), thirdParties]])
          .put(fetchThirdPartiesSuccess(thirdParties))
          .dispatch(fetchThirdPartiesRequest(address))
          .run({ silenceTimeout: true })
      })
    })

    describe('when no address is supplied', () => {
      it('should put the fetch third party success action with the api response', () => {
        return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
          .provide([[matchers.call.fn(mockBuilder.fetchThirdParties), thirdParties]])
          .put(fetchThirdPartiesSuccess(thirdParties))
          .dispatch(fetchThirdPartiesRequest())
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when fetching a third party', () => {
  describe('when the api request fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'Some Error Message'
    })

    it('should put the fetch third party fail action with an error', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[matchers.call.fn(mockBuilder.fetchThirdParty), throwError(new Error(errorMessage))]])
        .put(fetchThirdPartyFailure(errorMessage))
        .dispatch(fetchThirdPartyRequest('aThirdPartyId'))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch third party success action with the api response', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[matchers.call.fn(mockBuilder.fetchThirdParty), thirdParty]])
        .put(fetchThirdPartySuccess(thirdParty))
        .dispatch(fetchThirdPartyRequest(thirdParty.id))
        .run({ silenceTimeout: true })
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
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[matchers.call.fn(mockBuilder.fetchThirdPartyAvailableSlots), throwError(new Error(errorMessage))]])
        .put(fetchThirdPartyAvailableSlotsFailure(errorMessage))
        .dispatch(fetchThirdPartyAvailableSlotsRequest(thirdParty.id))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the api request succeeds', () => {
    it('should put the fetch third party success action the response', () => {
      const mockedAvaibleSlots = 20
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
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

    it('should put the publish third party items fail action with an error, show the error toast and close the modal', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getCollection, item.collectionId), collection],
          [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
          [
            retry(20, 5000, mockBuilder.publishTPCollection, item.collectionId!, [item.id], { signature, qty, salt }),
            throwError(new Error(errorMessage))
          ]
        ])
        .put(closeModal('PublishThirdPartyCollectionModal'))
        .put.like({ action: { type: SHOW_TOAST, payload: { toast: { type: ToastType.ERROR } } } })
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

    it('should put the fetch third party success action with the new itemCurations and open the PublishThirdPartyCollectionModal modal with the success step', () => {
      const mockedItemReturnedByServer = { ...mockedItem, id: 'a new id' }
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getCollection, item.collectionId), collection],
          [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
          [
            retry(20, 5000, mockBuilder.publishTPCollection, item.collectionId!, [item.id], { signature, qty, salt }),
            { collection, items: [mockedItemReturnedByServer], itemCurations }
          ]
        ])
        .put(publishThirdPartyItemsSuccess(thirdParty.id, item.collectionId!, [mockedItemReturnedByServer], itemCurations))
        .put(
          openModal('PublishThirdPartyCollectionModal', {
            collectionId: item.collectionId,
            itemIds: [],
            action: PublishButtonAction.NONE,
            step: PublishThirdPartyCollectionModalStep.SUCCESS
          })
        )
        .dispatch(publishThirdPartyItemsRequest(thirdParty, [item]))
        .run({ silenceTimeout: true })
    })

    it('should put the fetch available slots action when the push finishes successfully', () => {
      const mockedItemReturnedByServer = { ...mockedItem, id: 'a new id' }
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
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
    collection = { name: 'valid collection name', id: uuidv4(), isMappingComplete: true } as Collection
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

    it('should put the push changes third party items fail action with an error, show the error toast, close the modal and reset the progress', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getItemCurations, item.collectionId), itemCurations],
          [select(getCollection, item.collectionId), collection],
          [call([mockBuilder, mockBuilder.updateItemCurationStatus], item.id, itemCurations[0].status), throwError(new Error('Error'))]
        ])
        .put(pushChangesThirdPartyItemsFailure('Some item curations were not pushed'))
        .put(updateThirdPartyActionProgress(0, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
        .put(closeModal('PublishThirdPartyCollectionModal'))
        .put.like({ action: { type: SHOW_TOAST, payload: { toast: { type: ToastType.ERROR } } } })
        .dispatch(pushChangesThirdPartyItemsRequest([item]))
        .run({ silenceTimeout: true })
    })
  })

  describe('when both api requests succeed', () => {
    let updatedItemCurations: ItemCuration[]
    beforeEach(() => {
      collection = { name: 'valid collection name', id: uuidv4(), isMappingComplete: true } as Collection
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

    describe('and the collection does not have its mapping complete', () => {
      beforeEach(() => {
        collection = { name: 'valid collection name', id: uuidv4(), isMappingComplete: false } as Collection
      })

      it('should put an action to re fetch the collection', () => {
        const anotherItem = { ...mockedItem, id: 'anotherItemId' }
        return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
          .provide([
            [select(getItemCurations, item.collectionId), itemCurations],
            [select(getCollection, item.collectionId), collection],
            [take(FETCH_COLLECTION_SUCCESS), undefined]
          ])
          .put(fetchCollectionRequest(item.collectionId ?? ''))
          .dispatch(pushChangesThirdPartyItemsRequest([item, anotherItem]))
          .run({ silenceTimeout: true })
      })
    })

    it('should put the push changes success action with the updated item curations, open the PublishThirdPartyCollectionModal modal with the success step and reset the progress', () => {
      const anotherItem = { ...mockedItem, id: 'anotherItemId' }
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getItemCurations, item.collectionId), itemCurations],
          [select(getCollection, item.collectionId), collection]
        ])
        .put(updateThirdPartyActionProgress(100, ThirdPartyAction.PUSH_CHANGES))
        .put(updateThirdPartyActionProgress(0, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
        .put(pushChangesThirdPartyItemsSuccess(item.collectionId!, updatedItemCurations))
        .put(
          openModal('PublishThirdPartyCollectionModal', {
            collectionId: item.collectionId,
            itemIds: [],
            action: PublishButtonAction.NONE,
            step: PublishThirdPartyCollectionModalStep.SUCCESS
          })
        )
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
  let email: string
  let subscribeToNewsletter: boolean
  let linkedWearablesPaymentsEnabled: boolean

  beforeEach(() => {
    collection = { name: 'valid collection name', id: uuidv4(), isMappingComplete: true } as Collection
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
    email = 'anEmail@provider.com'
    subscribeToNewsletter = true
    linkedWearablesPaymentsEnabled = false
  })

  describe('when the collection is not found', () => {
    it('should put the publish & push changes failure action and reset the progress', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getCollection, item.collectionId), undefined],
          [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled]
        ])
        .put(publishAndPushChangesThirdPartyItemsFailure('Collection not found'))
        .put(updateThirdPartyActionProgress(0, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
        .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, [item], [mockedItem]))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the email is available', () => {
    beforeEach(() => {
      // Force it to fail so it doesn't continue
      thirdParty.availableSlots = undefined
    })

    it('should save the TOS', async () => {
      await expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getCollection, item.collectionId), collection],
          [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled]
        ])
        .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, [item], [mockedItem], undefined, email, subscribeToNewsletter))
        .run({ silenceTimeout: true })
      expect(mockBuilder.saveTOS).toHaveBeenCalledWith(TermsOfServiceEvent.PUBLISH_THIRD_PARTY_ITEMS, collection, email, [
        item.currentContentHash,
        mockedItem.currentContentHash
      ])
    })

    describe('and the subscribe to newsletter flag is set', () => {
      beforeEach(() => {
        // Force it to fail so it doesn't continue
        thirdParty.availableSlots = undefined
        subscribeToNewsletter = true
      })

      it('should put the subscribe to newsletter request action', () => {
        return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
          .provide([
            [select(getCollection, item.collectionId), collection],
            [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled]
          ])
          .put(subscribeToNewsletterRequest(email, 'Builder Wearables creator'))
          .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, [item], [mockedItem], undefined, email, subscribeToNewsletter))
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('when the third party does not have its available slots fetched', () => {
    beforeEach(() => {
      thirdParty.availableSlots = undefined
    })

    it('should put the publish & push changes failure action and reset the progress', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getCollection, item.collectionId), collection],
          [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled]
        ])
        .put(publishAndPushChangesThirdPartyItemsFailure('Third party available slots must be defined before publishing'))
        .put(updateThirdPartyActionProgress(0, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
        .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, [item], [mockedItem]))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the linked wearables payments is enabled', () => {
    let maxSlotPrice: string | undefined

    beforeEach(() => {
      linkedWearablesPaymentsEnabled = true
    })

    describe('and there are items to publish', () => {
      beforeEach(() => {
        itemsToPublish = [itemWithChanges]
      })

      describe("and there aren't enough available slots to publish them", () => {
        beforeEach(() => {
          thirdParty.availableSlots = 0
        })

        describe('and the max slot price is not defined', () => {
          beforeEach(() => {
            maxSlotPrice = undefined
          })

          it('should put the publish & push changes failure action and reset the progress', () => {
            return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
              .provide([
                [select(getCollection, item.collectionId), collection],
                [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled]
              ])
              .put(publishAndPushChangesThirdPartyItemsFailure('Max slot price must be defined'))
              .put(updateThirdPartyActionProgress(0, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
              .dispatch(
                publishAndPushChangesThirdPartyItemsRequest(
                  thirdParty,
                  itemsToPublish,
                  [],
                  undefined,
                  email,
                  subscribeToNewsletter,
                  maxSlotPrice
                )
              )
              .run({ silenceTimeout: true })
          })
        })

        describe('and the max slot price is defined', () => {
          let contractData: ContractData
          let missingSlots: string
          let minSlots: string

          beforeEach(() => {
            maxSlotPrice = '1'
            missingSlots = (itemsToPublish.length - (thirdParty.availableSlots ?? 0)).toString()
          })

          describe('and the third party is not published', () => {
            beforeEach(() => {
              thirdParty.published = false
              contractData = getContract(ContractName.ThirdPartyRegistry, ChainId.MATIC_AMOY)
            })

            describe('and the add third parties transaction fails', () => {
              it('should put the publish & push changes failure action and reset the progress', () => {
                return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
                  .provide([
                    [select(getCollection, item.collectionId), collection],
                    [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
                    [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_AMOY],
                    [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_AMOY), contractData],
                    [matchers.call.fn(sendTransaction), Promise.reject(new Error('Failed to perform the transaction'))]
                  ])
                  .put(publishAndPushChangesThirdPartyItemsFailure('Failed to perform the transaction'))
                  .put(updateThirdPartyActionProgress(0, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
                  .dispatch(
                    publishAndPushChangesThirdPartyItemsRequest(
                      thirdParty,
                      itemsToPublish,
                      [],
                      undefined,
                      email,
                      subscribeToNewsletter,
                      maxSlotPrice
                    )
                  )
                  .run({ silenceTimeout: true })
              })
            })

            describe('and the add third parties transaction succeeds', () => {
              describe('and the third party is programmatic', () => {
                beforeEach(() => {
                  thirdParty.isProgrammatic = true
                })

                describe('and the amount of items to publish is lower than the minimum amount of slots the programmatic third party should have', () => {
                  beforeEach(() => {
                    minSlots = '2'
                  })

                  it('should send the transaction to create the third party with the minimum amount of slots, wait for it to finish and delete the virtual third party', () => {
                    return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
                      .provide([
                        [select(getCollection, item.collectionId), collection],
                        [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
                        [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_AMOY],
                        [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_AMOY), contractData],
                        [matchers.call.fn(sendTransaction), '0x123'],
                        // Next handler mocks
                        [call(waitForTx, '0x123'), undefined],
                        [retry(20, 5000, mockBuilder.deleteVirtualThirdParty, thirdParty.id), undefined],
                        [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
                        [
                          call([mockBuilder, mockBuilder.publishTPCollection], item.collectionId!, [item.id], { signature, qty, salt }),
                          { collection, items: itemsToPublish, itemCurations }
                        ]
                      ])
                      .call(
                        sendTransaction,
                        contractData,
                        'addThirdParties',
                        [
                          [
                            thirdParty.id,
                            convertThirdPartyMetadataToRawMetadata(thirdParty.name, thirdParty.description, thirdParty.contracts),
                            'Disabled',
                            thirdParty.managers,
                            [true],
                            minSlots
                          ]
                        ],
                        [thirdParty.isProgrammatic],
                        [maxSlotPrice]
                      )
                      .put(
                        publishAndPushChangesThirdPartyItemsSuccess(
                          thirdParty,
                          collection,
                          itemsToPublish,
                          [],
                          undefined,
                          '0x123',
                          ChainId.MATIC_AMOY
                        )
                      )
                      .dispatch(
                        publishAndPushChangesThirdPartyItemsRequest(
                          thirdParty,
                          itemsToPublish,
                          [],
                          undefined,
                          email,
                          subscribeToNewsletter,
                          maxSlotPrice,
                          minSlots
                        )
                      )
                      .run({ silenceTimeout: true })
                  })
                })

                describe('and the amount of items to publish is higher or equal than the minimum amount of slots the programmatic third party should have', () => {
                  beforeEach(() => {
                    minSlots = '0'
                  })

                  it('should send the transaction to create the third party with amount of slots to publish, wait for it to finish and delete the virtual third party', () => {
                    return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
                      .provide([
                        [select(getCollection, item.collectionId), collection],
                        [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
                        [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_AMOY],
                        [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_AMOY), contractData],
                        [matchers.call.fn(sendTransaction), '0x123'],
                        // Next handler mocks
                        [call(waitForTx, '0x123'), undefined],
                        [retry(20, 5000, mockBuilder.deleteVirtualThirdParty, thirdParty.id), undefined],
                        [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
                        [
                          call([mockBuilder, mockBuilder.publishTPCollection], item.collectionId!, [item.id], { signature, qty, salt }),
                          { collection, items: itemsToPublish, itemCurations }
                        ]
                      ])
                      .call(
                        sendTransaction,
                        contractData,
                        'addThirdParties',
                        [
                          [
                            thirdParty.id,
                            convertThirdPartyMetadataToRawMetadata(thirdParty.name, thirdParty.description, thirdParty.contracts),
                            'Disabled',
                            thirdParty.managers,
                            [true],
                            missingSlots
                          ]
                        ],
                        [thirdParty.isProgrammatic],
                        [maxSlotPrice]
                      )
                      .put(
                        publishAndPushChangesThirdPartyItemsSuccess(
                          thirdParty,
                          collection,
                          itemsToPublish,
                          [],
                          undefined,
                          '0x123',
                          ChainId.MATIC_AMOY
                        )
                      )
                      .dispatch(
                        publishAndPushChangesThirdPartyItemsRequest(
                          thirdParty,
                          itemsToPublish,
                          [],
                          undefined,
                          email,
                          subscribeToNewsletter,
                          maxSlotPrice,
                          minSlots
                        )
                      )
                      .run({ silenceTimeout: true })
                  })
                })
              })

              describe('and the third party is not programmatic', () => {
                beforeEach(() => {
                  thirdParty.isProgrammatic = false
                })

                it('should send the transaction to create the third party, wait for it to finish and delete the virtual third party', () => {
                  return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
                    .provide([
                      [select(getCollection, item.collectionId), collection],
                      [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
                      [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_AMOY],
                      [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_AMOY), contractData],
                      [matchers.call.fn(sendTransaction), '0x123'],
                      // Next handler mocks
                      [call(waitForTx, '0x123'), undefined],
                      [retry(20, 5000, mockBuilder.deleteVirtualThirdParty, thirdParty.id), undefined],
                      [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
                      [
                        call([mockBuilder, mockBuilder.publishTPCollection], item.collectionId!, [item.id], { signature, qty, salt }),
                        { collection, items: itemsToPublish, itemCurations }
                      ]
                    ])
                    .call(
                      sendTransaction,
                      contractData,
                      'addThirdParties',
                      [
                        [
                          thirdParty.id,
                          convertThirdPartyMetadataToRawMetadata(thirdParty.name, thirdParty.description, thirdParty.contracts),
                          'Disabled',
                          thirdParty.managers,
                          [true],
                          missingSlots
                        ]
                      ],
                      [thirdParty.isProgrammatic],
                      [maxSlotPrice]
                    )
                    .put(
                      publishAndPushChangesThirdPartyItemsSuccess(
                        thirdParty,
                        collection,
                        itemsToPublish,
                        [],
                        undefined,
                        '0x123',
                        ChainId.MATIC_AMOY
                      )
                    )
                    .dispatch(
                      publishAndPushChangesThirdPartyItemsRequest(
                        thirdParty,
                        itemsToPublish,
                        [],
                        undefined,
                        email,
                        subscribeToNewsletter,
                        maxSlotPrice
                      )
                    )
                    .run({ silenceTimeout: true })
                })
              })
            })
          })

          describe('and the third party is published', () => {
            beforeEach(() => {
              thirdParty.published = true
            })

            describe('and the buy item slots transaction succeeds', () => {
              it('should send the transaction to buy the missing slots and wait for it to finish', () => {
                return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
                  .provide([
                    [select(getCollection, item.collectionId), collection],
                    [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
                    [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_AMOY],
                    [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_AMOY), contractData],
                    [matchers.call.fn(sendTransaction), '0x123'],
                    // Next handler mocks
                    [call(waitForTx, '0x123'), undefined],
                    [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
                    [
                      call([mockBuilder, mockBuilder.publishTPCollection], item.collectionId!, [item.id], { signature, qty, salt }),
                      { collection, items: itemsToPublish, itemCurations }
                    ]
                  ])
                  .call(sendTransaction, contractData, 'buyItemSlots', thirdParty.id, missingSlots, maxSlotPrice)
                  .dispatch(
                    publishAndPushChangesThirdPartyItemsRequest(
                      thirdParty,
                      itemsToPublish,
                      [],
                      undefined,
                      email,
                      subscribeToNewsletter,
                      maxSlotPrice
                    )
                  )
                  .run({ silenceTimeout: true })
              })
            })

            describe('and the add third parties transaction fails', () => {
              it('should put the publish & push changes failure action and reset the progress', () => {
                return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
                  .provide([
                    [select(getCollection, item.collectionId), collection],
                    [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
                    [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_AMOY],
                    [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_AMOY), contractData],
                    [matchers.call.fn(sendTransaction), Promise.reject(new Error('Failed to perform the transaction'))]
                  ])
                  .put(publishAndPushChangesThirdPartyItemsFailure('Failed to perform the transaction'))
                  .put(updateThirdPartyActionProgress(0, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
                  .dispatch(
                    publishAndPushChangesThirdPartyItemsRequest(
                      thirdParty,
                      itemsToPublish,
                      [],
                      undefined,
                      email,
                      subscribeToNewsletter,
                      maxSlotPrice
                    )
                  )
                  .run({ silenceTimeout: true })
              })
            })
          })
        })
      })

      describe('and there are enough available slots to publish them', () => {
        beforeEach(() => {
          thirdParty.availableSlots = 1
        })

        it('should not perform any transaction', () => {
          return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
            .provide([
              [select(getCollection, item.collectionId), collection],
              [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
              [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
              [
                call([mockBuilder, mockBuilder.publishTPCollection], item.collectionId!, [item.id], { signature, qty, salt }),
                { collection, items: itemsToPublish, itemCurations }
              ]
            ])
            .not.call.fn(sendTransaction)
            .dispatch(
              publishAndPushChangesThirdPartyItemsRequest(
                thirdParty,
                itemsToPublish,
                [],
                undefined,
                email,
                subscribeToNewsletter,
                maxSlotPrice
              )
            )
            .run({ silenceTimeout: true })
        })
      })
    })
  })

  describe('when the publish items fails', () => {
    it('should put the publish & push changes failure action, show the error toast, close the modal and reset the progress', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getCollection, item.collectionId), collection],
          [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
          [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
          [
            retry(20, 5000, mockBuilder.publishTPCollection, item.collectionId!, [item.id], { signature, qty, salt }),
            throwError(new Error(errorMessage))
          ]
        ])
        .put(closeModal('PublishThirdPartyCollectionModal'))
        .put.like({ action: { type: SHOW_TOAST, payload: { toast: { type: ToastType.ERROR } } } })
        .put(finishPublishAndPushChangesThirdPartyItemsFailure(errorMessage))
        .put(updateThirdPartyActionProgress(0, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
        .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, itemsToPublish, [mockedItem]))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the publish works fine but push items fails', () => {
    beforeEach(() => {
      ;(mockBuilder.pushItemCuration as jest.Mock).mockRejectedValue(new Error(errorMessage))
    })
    it('should put the publish & push changes failure action', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
          [select(getItemCurations, item.collectionId), itemCurations],
          [select(getCollection, item.collectionId), collection],
          [
            retry(20, 5000, mockBuilder.publishTPCollection, item.collectionId!, [item.id], { signature, qty, salt }),
            { items: publishResponse, itemCurations }
          ]
        ])
        .put(finishPublishAndPushChangesThirdPartyItemsFailure(errorMessage))
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
      ;(mockBuilder.pushItemCuration as jest.Mock).mockResolvedValue(updatedItemCurations[0])
    })

    describe('and the collection does not have its mapping complete', () => {
      beforeEach(() => {
        collection = { name: 'valid collection name', id: uuidv4(), isMappingComplete: false } as Collection
      })

      it('should put an action to re fetch the collection', () => {
        return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
          .provide([
            [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
            [select(getItemCurations, item.collectionId), itemCurations],
            [select(getCollection, item.collectionId), collection],
            [take(FETCH_COLLECTION_SUCCESS), undefined],
            [
              retry(20, 5000, mockBuilder.publishTPCollection, item.collectionId!, [item.id], { signature, qty, salt }),
              { items: publishResponse, itemCurations }
            ]
          ])
          .put(fetchCollectionRequest(collection.id))
          .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, itemsToPublish, [itemWithChanges]))
          .run({ silenceTimeout: true })
      })
    })

    it('should put the publish & push changes success action, the fetch available slots request and reset the progress', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
          [select(getItemCurations, item.collectionId), itemCurations],
          [select(getCollection, item.collectionId), collection],
          [take(FETCH_COLLECTION_SUCCESS), undefined],
          [
            retry(20, 5000, mockBuilder.publishTPCollection, item.collectionId!, [item.id], { signature, qty, salt }),
            { items: publishResponse, itemCurations }
          ]
        ])
        .put(updateThirdPartyActionProgress(100, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
        .put(finishPublishAndPushChangesThirdPartyItemsSuccess(thirdParty, item.collectionId!, [...itemCurations, updatedItemCurations[0]]))
        .put(fetchThirdPartyAvailableSlotsRequest(thirdParty.id))
        .dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, itemsToPublish, [itemWithChanges]))
        .run({ silenceTimeout: true })
    })
  })

  describe("when there's only push changes to do", () => {
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
      ;(mockBuilder.pushItemCuration as jest.Mock).mockResolvedValue(updatedItemCurations[0])
      collection.isPublished = true
      linkedWearablesPaymentsEnabled = true
    })

    it('should put the finish publish & push changes success action and close the modal', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [call(getPublishItemsSignature, thirdParty.id, qty), { signature, salt, qty }],
          [select(getItemCurations, item.collectionId), itemCurations],
          [select(getCollection, item.collectionId), collection],
          [select(getIsLinkedWearablesPaymentsEnabled), linkedWearablesPaymentsEnabled],
          [take(FETCH_COLLECTION_SUCCESS), undefined]
        ])
        .put(updateThirdPartyActionProgress(100, ThirdPartyAction.PUSH_CHANGES)) // resets the progress
        .put(finishPublishAndPushChangesThirdPartyItemsSuccess(thirdParty, itemWithChanges.collectionId!, [updatedItemCurations[0]]))
        .put(closeModal('PushChangesModal'))
        .dispatch(publishAndPushChangesThirdPartyItemsSuccess(thirdParty, collection, [], [itemWithChanges]))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the batched deployment of third party items', () => {
  let items: Item[]
  let collection: Collection
  let tree: MerkleDistributorInfo
  let hashes: Record<string, string>
  let auth: AuthIdentity
  let deploymentData: DeploymentPreparationData[]

  beforeEach(() => {
    auth = {} as AuthIdentity
    items = [
      { ...mockedItem, currentContentHash: 'fstItemHash' },
      { ...mockedItem, id: 'anotherId', currentContentHash: 'sndItemHash' }
    ]
    collection = { id: items[0].collectionId, name: 'someCollectionName' } as Collection
    tree = {
      merkleRoot: 'someMerkleRoot',
      total: 2,
      proofs: {
        [items[0].currentContentHash!]: {
          index: 0,
          proof: []
        },
        [items[1].currentContentHash!]: {
          index: 1,
          proof: []
        }
      }
    }
    hashes = {
      [items[0].id]: items[0].collectionId!,
      [items[1].id]: items[1].collectionId!
    }
    deploymentData = [
      {
        entityId: 'fstItemEntityId',
        files: new Map()
      },
      {
        entityId: 'fstItemEntityId',
        files: new Map()
      }
    ]
  })

  describe("and the identity couldn't get retrieved", () => {
    it('should put a failure action signaling that the identity is invalid', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[call(getIdentity), undefined]])
        .put(deployBatchedThirdPartyItemsFailure([], 'Invalid Identity'))
        .dispatch(deployBatchedThirdPartyItemsRequest(items, collection, tree, hashes))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the items to be deployed failed to build the entities', () => {
    let errors: ThirdPartyError[]
    beforeEach(() => {
      ;(buildTPItemEntity as unknown as jest.Mock).mockRejectedValue(new Error('Failed to fetch contents'))
      ;(Authenticator.signPayload as unknown as jest.Mock<typeof Authenticator.signPayload>).mockResolvedValueOnce({
        type: AuthLinkType.ECDSA_PERSONAL_EPHEMERAL,
        payload: 'somePayload',
        signature: {}
      } as never)
      errors = [new ThirdPartyBuildEntityError(items[0]), new ThirdPartyBuildEntityError(items[1])]
    })

    it('should put a failure action with the errors that occurred when deploying', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[call(getIdentity), auth]])
        .put(deployBatchedThirdPartyItemsFailure(errors))
        .dispatch(deployBatchedThirdPartyItemsRequest(items, collection, tree, hashes))
        .run({ silenceTimeout: true })
    })
  })

  describe('when some one of the items to be deployed failed to do so', () => {
    let errors: ThirdPartyError[]
    beforeEach(() => {
      ;(buildTPItemEntity as unknown as jest.Mock).mockResolvedValueOnce(deploymentData[0]).mockResolvedValueOnce(deploymentData[1])
      ;(deployMock as unknown as jest.Mock).mockResolvedValueOnce(0).mockRejectedValueOnce(new Error('Failed to deploy'))
      ;(Authenticator.signPayload as unknown as jest.Mock<typeof Authenticator.signPayload>).mockResolvedValueOnce({
        type: AuthLinkType.ECDSA_PERSONAL_EPHEMERAL,
        payload: 'somePayload',
        signature: {}
      } as never)
      errors = [new ThirdPartyDeploymentError(items[0])]
    })

    it('should put a failure action with the errors that occurred when deploying', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[call(getIdentity), auth]])
        .put(deployBatchedThirdPartyItemsFailure(errors))
        .dispatch(deployBatchedThirdPartyItemsRequest(items, collection, tree, hashes))
        .run({ silenceTimeout: true })
    })
  })

  describe('when one of the item curations of an item fails to be updated', () => {
    let errors: ThirdPartyError[]
    beforeEach(() => {
      ;(buildTPItemEntity as unknown as jest.Mock).mockResolvedValueOnce(deploymentData[0]).mockResolvedValueOnce(deploymentData[1])
      ;(deployMock as unknown as jest.Mock).mockResolvedValueOnce(0)
      ;(mockBuilder.updateItemCurationStatus as jest.Mock).mockRejectedValueOnce(new Error('Failed to update'))
      ;(Authenticator.signPayload as unknown as jest.Mock<typeof Authenticator.signPayload>).mockResolvedValueOnce({
        type: AuthLinkType.ECDSA_PERSONAL_EPHEMERAL,
        payload: 'somePayload',
        signature: {}
      } as never)
      errors = [new ThirdPartyCurationUpdateError(items[0])]
    })

    it('should put a failure action with the errors that occurred when updating the item curation', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[call(getIdentity), auth]])
        .put(deployBatchedThirdPartyItemsFailure(errors))
        .dispatch(deployBatchedThirdPartyItemsRequest(items, collection, tree, hashes))
        .run({ silenceTimeout: true })
    })
  })

  describe('when all of the items to be deployed are successfully deployed', () => {
    let itemCurations: ItemCuration[]

    beforeEach(() => {
      itemCurations = [
        {
          id: 'id',
          itemId: 'itemId',
          createdAt: 0,
          status: CurationStatus.APPROVED,
          updatedAt: 0,
          contentHash: 'aHash'
        },
        {
          id: 'anotherId',
          itemId: 'anotherItemId',
          createdAt: 0,
          status: CurationStatus.APPROVED,
          updatedAt: 0,
          contentHash: 'aHash'
        }
      ]
      ;(buildTPItemEntity as unknown as jest.Mock).mockResolvedValueOnce(deploymentData[0]).mockResolvedValueOnce(deploymentData[1])
      ;(deployMock as unknown as jest.Mock).mockResolvedValueOnce(0).mockResolvedValueOnce(1)
      ;(mockBuilder.updateItemCurationStatus as jest.Mock).mockResolvedValueOnce(itemCurations[0]).mockResolvedValueOnce(itemCurations[1])
      ;(Authenticator.signPayload as unknown as jest.Mock<typeof Authenticator.signPayload>).mockResolvedValueOnce({
        type: AuthLinkType.ECDSA_PERSONAL_EPHEMERAL,
        payload: 'somePayload',
        signature: {}
      } as never)
    })

    it('should put the success action with the deployment preparation data', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[call(getIdentity), auth]])
        .put(deployBatchedThirdPartyItemsSuccess(collection, itemCurations))
        .dispatch(deployBatchedThirdPartyItemsRequest(items, collection, tree, hashes))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the disabling of a third party', () => {
  let contract: ContractData

  beforeEach(() => {
    contract = { address: '0xcontract', abi: [], version: '1', name: 'name', chainId: ChainId.MATIC_MAINNET }
  })

  describe('and the transaction fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'Some Error Message'
    })

    it('should put a disable third party failure action with the error', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET],
          [select(getThirdParty, thirdParty.id), thirdParty],
          [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_MAINNET), contract],
          [call(sendTransaction as any, contract, 'reviewThirdParties', [[thirdParty.id, false, []]]), throwError(new Error(errorMessage))]
        ])
        .put(disableThirdPartyFailure(errorMessage))
        .dispatch(disableThirdPartyRequest(thirdParty.id))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the transaction succeeds', () => {
    let txHash: string
    beforeEach(() => {
      txHash = '0xtxHash'
    })

    it('should put a successful disable third party action with the transaction data', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([
          [select(getThirdParty, thirdParty.id), thirdParty],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET],
          [call(getContract, ContractName.ThirdPartyRegistry, ChainId.MATIC_MAINNET), contract],
          [call(sendTransaction as any, contract, 'reviewThirdParties', [[thirdParty.id, false, []]]), txHash]
        ])
        .put(disableThirdPartySuccess(thirdParty.id, ChainId.MATIC_MAINNET, txHash, thirdParty.name))
        .dispatch(disableThirdPartyRequest(thirdParty.id))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling setting a third party kind', () => {
  let thirdPartyId: string

  beforeEach(() => {
    thirdPartyId = 'aThirdPartyId'
  })

  describe('and the request succeeds', () => {
    it('should put the set third party kind success action and close the modal', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[call([mockBuilder, 'setThirdPartyKind'], thirdPartyId, true), Promise.resolve()]])
        .put(setThirdPartyKindSuccess(thirdPartyId, true))
        .dispatch(setThirdPartyKindRequest(thirdPartyId, true))
        .run({ silenceTimeout: true })
    })
  })

  describe('and the request fails', () => {
    let error: string

    beforeEach(() => {
      error = 'anError'
    })

    it('should put the set third party kind failure action and close the modal', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .provide([[call([mockBuilder, 'setThirdPartyKind'], thirdPartyId, true), Promise.reject(new Error(error))]])
        .put(setThirdPartyKindFailure(error))
        .dispatch(setThirdPartyKindRequest(thirdPartyId, true))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the closing a modal', () => {
  let modalName: string

  describe('and the modal is the publish collection wizard', () => {
    beforeEach(() => {
      modalName = 'PublishWizardCollectionModal'
    })

    it('should clear the third party errors', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .dispatch(closeModal(modalName))
        .put(clearThirdPartyErrors())
        .run({ silenceTimeout: true })
    })
  })

  describe('and the modal is the push changes modal', () => {
    beforeEach(() => {
      modalName = 'PushChangesModal'
    })

    it('should clear the third party errors', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .dispatch(closeModal(modalName))
        .put(clearThirdPartyErrors())
        .run({ silenceTimeout: true })
    })
  })

  describe('and the modal is not the publish collection wizard', () => {
    beforeEach(() => {
      modalName = 'AnotherModalName'
    })

    it('should not clear the third party errors', () => {
      return expectSaga(thirdPartySaga, mockBuilder, mockCatalystClient)
        .dispatch(closeModal(modalName))
        .not.put(clearThirdPartyErrors())
        .run({ silenceTimeout: true })
    })
  })
})
