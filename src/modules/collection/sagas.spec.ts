import { ethers } from 'ethers'
import { retry, race, take, call, put, select, delay } from 'redux-saga/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { generateTree } from '@dcl/content-hash-tree'
import { push, replace } from 'connected-react-router'
import { ChainId, Network, WearableRepresentation } from '@dcl/schemas'
import { Entity, EntityType, EntityVersion } from 'dcl-catalyst-commons'
import { CatalystClient, DeploymentPreparationData } from 'dcl-catalyst-client'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { locations } from 'routing/locations'
import { ApprovalFlowModalMetadata, ApprovalFlowModalView } from 'components/Modals/ApprovalFlowModal/ApprovalFlowModal.types'
import { buildItemEntity, buildTPItemEntity } from 'modules/item/export'
import { getEntityByItemId, getItems, getData as getItemsById } from 'modules/item/selectors'
import { Item, ItemApprovalData, WearableCategory } from 'modules/item/types'
import { openModal, closeModal } from 'modules/modal/actions'
import { fetchCollectionItemsRequest, fetchCollectionItemsSuccess, rescueItemsFailure, rescueItemsSuccess } from 'modules/item/actions'
import { deployEntitiesFailure, deployEntitiesSuccess } from 'modules/entity/actions'
import {
  approveCollectionCurationFailure,
  approveCollectionCurationRequest,
  approveCollectionCurationSuccess
} from 'modules/curations/collectionCuration/actions'
import { getCurationsByCollectionId } from 'modules/curations/collectionCuration/selectors'
import { consumeThirdPartyItemSlotsFailure, consumeThirdPartyItemSlotsSuccess } from 'modules/thirdParty/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { CurationStatus } from 'modules/curations/types'
import { BuilderAPI } from 'lib/api/builder'
import {
  approveCollectionFailure,
  approveCollectionSuccess,
  initiateApprovalFlow,
  saveCollectionRequest,
  saveCollectionSuccess,
  saveCollectionFailure,
  publishCollectionRequest,
  publishCollectionSuccess,
  publishCollectionFailure,
  SAVE_COLLECTION_SUCCESS,
  SAVE_COLLECTION_FAILURE,
  initiateTPApprovalFlow
} from './actions'
import { collectionSaga } from './sagas'
import { Collection } from './types'
import { getLatestItemHash, UNSYNCED_COLLECTION_ERROR_PREFIX } from './utils'

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  isTPDeployEnabled: jest.fn().mockReturnValue(true)
}))

const getCollection = (props: Partial<Collection> = {}): Collection =>
  ({ id: 'aCollection', isPublished: true, isApproved: false, ...props } as Collection)

const getTPCollection = (props: Partial<Collection> = {}): Collection =>
  ({
    id: 'aCollection',
    isPublished: true,
    isApproved: false,
    urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:one-third-party-collection',
    ...props
  } as Collection)

const getItem = (collection: Collection, props: Partial<Item> = {}): Item =>
  ({
    id: 'anItem',
    collectionId: collection.id,
    name: 'An Item',
    description: 'This is an item',
    blockchainContentHash: 'QmSynced',
    contents: { 'thumbnail.png': 'QmThumbnailHash' } as Record<string, string>,
    data: {
      category: WearableCategory.HAT,
      hides: [] as WearableCategory[],
      replaces: [] as WearableCategory[],
      tags: [] as string[],
      representations: [] as WearableRepresentation[]
    },
    ...props
  } as Item)

const getEntity = (item: Item, props: Partial<Entity> = {}): Entity => ({
  id: 'anEntity',
  content: Object.keys(item.contents).map(file => ({ file, hash: item.contents[file] })),
  metadata: {
    urn: 'urn:decentraland:collections-v2:aCollection:anItem',
    name: item.name,
    description: item.description,
    data: item.data
  },
  timestamp: 0,
  type: EntityType.WEARABLE,
  pointers: ['urn:decentraland:collections-v2:aCollection:anItem'],
  version: EntityVersion.V3,
  ...props
})

const getDeployData = (): DeploymentPreparationData => ({ entityId: 'QmNewEntityId', files: new Map() })

const getCuration = (collection: Collection, props: Partial<CollectionCuration> = {}): CollectionCuration =>
  ({
    id: 'aCuration',
    collectionId: collection.id,
    status: CurationStatus.PENDING,
    ...props
  } as CollectionCuration)

let mockBuilder: BuilderAPI
let mockCatalyst: CatalystClient

beforeEach(() => {
  mockBuilder = ({
    saveCollection: jest.fn(),
    lockCollection: jest.fn(),
    saveTOS: jest.fn(),
    fetchApprovalData: jest.fn(),
    updateItemCurationStatus: jest.fn(),
    fetchCollectionItems: jest.fn().mockResolvedValueOnce([])
  } as unknown) as BuilderAPI
  mockCatalyst = ({} as unknown) as CatalystClient
})

describe('when executing the approval flow', () => {
  describe('when a collection is not published', () => {
    it('should open the modal in an error state', () => {
      const collection = getCollection({ isPublished: false })
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection,
            error: `The collection can't be approved because it's not published`
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when a collection has not been approved yet', () => {
    const collection = getCollection()
    const syncedItem = getItem(collection)
    const unsyncedItem = getItem(collection, {
      id: 'anotherItem',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    it('should complete the flow doing the rescue, deploy and approve collection steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(getLatestItemHash, collection, syncedItem), syncedItem.blockchainContentHash],
          [call(getLatestItemHash, collection, unsyncedItem), updatedItem.blockchainContentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockCatalyst, collection, unsyncedItem), deployData]
        ])
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.RESCUE,
            collection,
            items: [unsyncedItem],
            contentHashes: [updatedItem.blockchainContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.blockchainContentHash!], ChainId.MATIC_MAINNET, ['0xhash']))
        .put(fetchCollectionItemsRequest(collection.id))
        .dispatch(fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection,
            items: [unsyncedItem],
            entities: [deployData]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([deployData]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.APPROVE,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(approveCollectionSuccess({ ...collection, isApproved: true }, ChainId.MATIC_MAINNET, '0xhash2'))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.SUCCESS,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when a collection has already been approved but it has a pending curation', () => {
    const collection = getCollection({ isApproved: true })
    const syncedItem = getItem(collection)
    const unsyncedItem = getItem(collection, {
      id: 'anotherItem',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    const curation = getCuration(collection)
    it('should complete the flow doing a rescue, deploy and approve curation steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(getLatestItemHash, collection, syncedItem), syncedItem.blockchainContentHash],
          [call(getLatestItemHash, collection, unsyncedItem), updatedItem.blockchainContentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockCatalyst, collection, unsyncedItem), deployData],
          [select(getCurationsByCollectionId), { [collection.id]: curation }]
        ])
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.RESCUE,
            collection,
            items: [unsyncedItem],
            contentHashes: [updatedItem.blockchainContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.blockchainContentHash!], ChainId.MATIC_MAINNET, ['0xhash']))
        .put(fetchCollectionItemsRequest(collection.id))
        .dispatch(fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection,
            items: [unsyncedItem],
            entities: [deployData]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([deployData]))
        .put(approveCollectionCurationRequest(collection.id))
        .dispatch(approveCollectionCurationSuccess(collection.id))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.SUCCESS,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when a collection has already the same content hashes in the DB and in the blockchain, the entities are synced with the ones in the catalyst, the collection is approved and there are no pending curations', () => {
    const collection = getCollection({ isApproved: true })
    const items = [getItem(collection), getItem(collection, { id: 'anotherItem' })]
    const entities = [getEntity(items[0]), getEntity(items[1])]
    const curation = getCuration(collection, { status: CurationStatus.APPROVED })
    it('should skip all the unnecessary steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), items],
          [call(getLatestItemHash, collection, items[0]), items[0].blockchainContentHash],
          [call(getLatestItemHash, collection, items[1]), items[1].blockchainContentHash],
          [select(getItems), items],
          [
            select(getEntityByItemId),
            {
              [items[0].id]: entities[0],
              [items[1].id]: entities[1]
            }
          ],
          [select(getCurationsByCollectionId), { [collection.id]: curation }]
        ])
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.SUCCESS,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when the rescue transaction fails', () => {
    const collection = getCollection({ isApproved: true })
    const syncedItem = getItem(collection)
    const unsyncedItem = getItem(collection, {
      id: 'anotherItem',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const rescueError = 'Rescue Transaction Error'
    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(getLatestItemHash, collection, syncedItem), syncedItem.blockchainContentHash],
          [call(getLatestItemHash, collection, unsyncedItem), updatedItem.blockchainContentHash]
        ])
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.RESCUE,
            collection,
            items: [unsyncedItem],
            contentHashes: [updatedItem.blockchainContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsFailure(collection, [unsyncedItem], [updatedItem.blockchainContentHash!], rescueError))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection,
            error: rescueError
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when the deployment to the catalyst fails', () => {
    const collection = getCollection()
    const syncedItem = getItem(collection)
    const unsyncedItem = getItem(collection, {
      id: 'anotherItem',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    const deployError = 'Deployment Error'
    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(getLatestItemHash, collection, syncedItem), syncedItem.blockchainContentHash],
          [call(getLatestItemHash, collection, unsyncedItem), updatedItem.blockchainContentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockCatalyst, collection, unsyncedItem), deployData]
        ])
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.RESCUE,
            collection,
            items: [unsyncedItem],
            contentHashes: [updatedItem.blockchainContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.blockchainContentHash!], ChainId.MATIC_MAINNET, ['0xhash']))
        .put(fetchCollectionItemsRequest(collection.id))
        .dispatch(fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection,
            items: [unsyncedItem],
            entities: [deployData]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesFailure([deployData], deployError))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection,
            error: deployError
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when the approve collection transaction fails', () => {
    const collection = getCollection()
    const syncedItem = getItem(collection)
    const unsyncedItem = getItem(collection, {
      id: 'anotherItem',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    const approveError = 'Approve Collection Transaction Error'
    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(getLatestItemHash, collection, syncedItem), syncedItem.blockchainContentHash],
          [call(getLatestItemHash, collection, unsyncedItem), updatedItem.blockchainContentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockCatalyst, collection, unsyncedItem), deployData]
        ])
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.RESCUE,
            collection,
            items: [unsyncedItem],
            contentHashes: [updatedItem.blockchainContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.blockchainContentHash!], ChainId.MATIC_MAINNET, ['0xhash']))
        .put(fetchCollectionItemsRequest(collection.id))
        .dispatch(fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection,
            items: [unsyncedItem],
            entities: [deployData]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([deployData]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.APPROVE,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(approveCollectionFailure(collection, approveError))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection,
            error: approveError
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when the approve curation fails', () => {
    const collection = getCollection({ isApproved: true })
    const syncedItem = getItem(collection)
    const unsyncedItem = getItem(collection, {
      id: 'anotherItem',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    const curation = getCuration(collection)
    const curationError = 'CollectionCuration Error'

    it('should open the modal in an error state', () => {
      const approvedCollection = { ...collection, isApproved: true }
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(getLatestItemHash, collection, syncedItem), syncedItem.blockchainContentHash],
          [call(getLatestItemHash, collection, unsyncedItem), updatedItem.blockchainContentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockCatalyst, collection, unsyncedItem), deployData],
          [select(getCurationsByCollectionId), { [collection.id]: curation }]
        ])
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.RESCUE,
            collection,
            items: [unsyncedItem],
            contentHashes: [updatedItem.blockchainContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.blockchainContentHash!], ChainId.MATIC_MAINNET, ['0xhash']))
        .put(fetchCollectionItemsRequest(collection.id))
        .dispatch(fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection,
            items: [unsyncedItem],
            entities: [deployData]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([deployData]))
        .put(approveCollectionCurationRequest(collection.id))
        .dispatch(approveCollectionCurationFailure(approvedCollection.id, curationError))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection: approvedCollection,
            error: curationError
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when publishing a collection', () => {
    let collection: Collection
    let items: Item[]
    const email = 'email@domain.com'

    const address = '0xa'
    const txHash = '0xdeadbeef'

    beforeEach(() => {
      collection = { salt: 'some salt' } as Collection
      items = []
    })

    describe('when the transaction is sent correctly', () => {
      let finalCollection: Collection
      let newLock: Date
      beforeEach(() => {
        const now = Date.now()
        newLock = new Date(now)
        finalCollection = { ...collection, lock: now }
      })

      it('should lock the collection, send the TOS and dispatch a success with the new collection and redirect to the activity', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([
            [put(saveCollectionRequest(collection)), true],
            [
              race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
              { success: saveCollectionSuccess(collection) }
            ],
            [select(getAddress), [address]],
            [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET],
            [retry(10, 500, mockBuilder.lockCollection, collection), newLock],
            [retry(10, 500, mockBuilder.saveTOS, collection, email), undefined],
            [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
          ])
          .put(saveCollectionRequest(collection))
          .put(publishCollectionSuccess(finalCollection, items, ChainId.MATIC_MAINNET, txHash))
          .put(replace(locations.activity()))
          .dispatch(publishCollectionRequest(collection, items, email))
          .run({ silenceTimeout: true })
      })
    })

    describe('when the the provided items length does not match the length of server items', () => {
      let finalCollection: Collection
      beforeEach(() => {
        finalCollection = { ...collection, id: 'collection-id', lock: Date.now() + 1000 /* Will be locked */ }
      })

      it('should signal with a publish collection failure action with an unsynced collection error', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([[call([mockBuilder, 'fetchCollectionItems'], finalCollection.id), [{}]]])
          .put(publishCollectionFailure(finalCollection, items, `${UNSYNCED_COLLECTION_ERROR_PREFIX} Different items length`))
          .dispatch(publishCollectionRequest(finalCollection, items, email))
          .run({ silenceTimeout: true })
      })
    })

    describe('when the the provided items do not match the items found in the server', () => {
      let finalCollection: Collection
      beforeEach(() => {
        finalCollection = { ...collection, id: 'collection-id', lock: Date.now() + 1000 /* Will be locked */ }
        items = [{ id: 'item-id' }] as Item[]
      })

      it('should signal with a publish collection failure action with an unsynced collection error', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([[call([mockBuilder, 'fetchCollectionItems'], finalCollection.id), [{ id: 'other-item-id' }]]])
          .put(
            publishCollectionFailure(
              finalCollection,
              items,
              `${UNSYNCED_COLLECTION_ERROR_PREFIX} Item found in the server but not in the browser`
            )
          )
          .dispatch(publishCollectionRequest(finalCollection, items, email))
          .run({ silenceTimeout: true })
      })
    })

    describe('when the collection is locked', () => {
      let lockedCollection: Collection
      let finalCollection: Collection
      let newLock: Date

      beforeEach(() => {
        const now = Date.now()
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        newLock = new Date(now)
        lockedCollection = { ...collection, lock: tomorrow.getTime() }
        finalCollection = { ...collection, lock: now }
      })

      it('should skip saving the collection', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([
            [select(getAddress), [address]],
            [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET],
            [retry(10, 500, mockBuilder.lockCollection, lockedCollection), newLock],
            [retry(10, 500, mockBuilder.saveTOS, lockedCollection, email), undefined],
            [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
          ])
          .not.put(saveCollectionRequest(collection))
          .put(publishCollectionSuccess(finalCollection, items, ChainId.MATIC_MAINNET, txHash))
          .put(replace(locations.activity()))
          .dispatch(publishCollectionRequest(lockedCollection, items, email))
          .run({ silenceTimeout: true })
      })
    })

    describe('when the collection lacks a salt', () => {
      let saltlessCollection: Collection
      let errorMessage: string
      beforeEach(() => {
        errorMessage = 'Missing salt'
        saltlessCollection = { ...collection, salt: undefined }
      })

      it('should dispatch a failure action', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([
            [put(saveCollectionRequest(saltlessCollection)), true],
            [
              race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
              { success: saveCollectionSuccess(saltlessCollection) }
            ],
            [call(t, 'sagas.item.missing_salt'), errorMessage]
          ])
          .put(saveCollectionRequest(saltlessCollection))
          .put(publishCollectionFailure(saltlessCollection, items, errorMessage))
          .dispatch(publishCollectionRequest(saltlessCollection, items, email))
          .run({ silenceTimeout: true })
      })
    })

    describe('when saving the collection fails', () => {
      let errorMessage: string
      beforeEach(() => {
        errorMessage = 'Error saving the collection'
      })

      it('should dispatch a failure action', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([
            [put(saveCollectionRequest(collection)), true],
            [
              race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
              { failure: saveCollectionFailure(collection, errorMessage) }
            ]
          ])
          .put(saveCollectionRequest(collection))
          .put(publishCollectionFailure(collection, items, errorMessage))
          .dispatch(publishCollectionRequest(collection, items, email))
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('when saving a collection', () => {
    describe('when the text is invalid', () => {
      let invalidCollection: Collection
      let errorMessage: string
      beforeEach(() => {
        invalidCollection = { name: 'some|invalid:character' } as Collection
        errorMessage = 'Invalid character'
      })

      it('should dispatch a failure action', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([[call(t, 'sagas.collection.invalid_character'), errorMessage]])
          .put(saveCollectionFailure(invalidCollection, errorMessage))
          .dispatch(saveCollectionRequest(invalidCollection))
          .run({ silenceTimeout: true })
      })
    })

    describe('when the collection is locked', () => {
      let lockedCollection: Collection
      let errorMessage: string
      beforeEach(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        lockedCollection = { name: '', lock: tomorrow.getTime() } as Collection
        errorMessage = 'Collection is locked'
      })

      it('should dispatch a failure action', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([[call(t, 'sagas.collection.collection_locked'), errorMessage]])
          .put(saveCollectionFailure(lockedCollection, errorMessage))
          .dispatch(saveCollectionRequest(lockedCollection))
          .run({ silenceTimeout: true })
      })
    })

    describe("when it's a third party collection", () => {
      let thirdPartyCollection: Collection
      let remoteCollection: Collection

      beforeEach(() => {
        thirdPartyCollection = {
          name: 'some name',
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:tercer-fiesta-2'
        } as Collection
        remoteCollection = {
          contractAddress: '0xdeadbeef'
        } as Collection
      })

      it('should redirect to the detail page after creating the collection', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([
            [select(getOpenModals), { CreateThirdPartyCollectionModal: true }],
            [call([mockBuilder, 'saveCollection'], thirdPartyCollection, ''), remoteCollection]
          ])
          .put(push(locations.thirdPartyCollectionDetail(thirdPartyCollection.id)))
          .dispatch(saveCollectionRequest(thirdPartyCollection))
          .dispatch(closeModal('CreateThirdPartyCollectionModal'))
          .run({ silenceTimeout: true })
      })

      it('should save the collection without data', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([
            [select(getOpenModals), {}],
            [call([mockBuilder, 'saveCollection'], thirdPartyCollection, ''), remoteCollection]
          ])
          .put(saveCollectionSuccess({ ...thirdPartyCollection, contractAddress: remoteCollection.contractAddress }))
          .dispatch(saveCollectionRequest(thirdPartyCollection))
          .dispatch(closeModal('CreateCollectionModal'))
          .dispatch(closeModal('CreateThirdPartyCollectionModal'))
          .dispatch(closeModal('EditCollectionURNModal'))
          .dispatch(closeModal('EditCollectionNameModal'))
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when executing the TP approval flow', () => {
  describe('when a collection is not published', () => {
    it('should open the modal in an error state', () => {
      const collection = getTPCollection({ isPublished: false })
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .dispatch(initiateTPApprovalFlow(collection, []))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection,
            error: `The collection can't be approved because it's not published`
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when a collection has not been approved yet', () => {
    const TPCollection = getTPCollection()
    const syncedItem = getItem(TPCollection, { currentContentHash: 'QmSynced' })
    const unsyncedItem = getItem(TPCollection, {
      id: 'anotherItem',
      blockchainContentHash: 'QmOldContentHash',
      currentContentHash: 'notQmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    let cheque: ItemApprovalData['cheque']
    let contentHashes: ItemApprovalData['content_hashes']
    let itemsToApprove: Item[]
    beforeEach(() => {
      cheque = {
        qty: 2,
        salt: '0xsalt',
        signature:
          '0x0ba9770fd8778383f6d56faadc71e17b75f0d6e3ff0a408d5e6c4cee3bd70a16' +
          '3574da0ebfb1eaac261698b057b342e52ea53f85287272cea471a4cda41e3466' +
          '1b'
      }
      contentHashes = { [syncedItem.id]: 'itemHash' }
      itemsToApprove = [syncedItem, unsyncedItem]
    })

    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()

    describe('when sending an invalid cheque', () => {
      beforeEach(() => {
        cheque = {
          qty: 1,
          salt: '0xsalt',
          signature:
            '0x0ba9770fd8778383f6d56faadc71e17b75f0d6e3ff0a408d5e6c4cee3bd70a16' +
            '3574da0ebfb1eaac261698b057b342e52ea53f85287272cea471a4cda41e3466' +
            '1b'
        }
      })
      it('should throw an error if itemsToApprove length is different than the cheque qty', () => {
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([[call([mockBuilder, 'fetchApprovalData'], TPCollection.id), { cheque, content_hashes: contentHashes }]])
          .dispatch(initiateTPApprovalFlow(TPCollection, itemsToApprove))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.LOADING,
              collection: TPCollection
            } as ApprovalFlowModalMetadata)
          )
          .dispatch(deployEntitiesSuccess([deployData]))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.ERROR,
              collection: TPCollection,
              error: 'Invalid qty of items to approve in the cheque'
            } as ApprovalFlowModalMetadata<ApprovalFlowModalView.ERROR>)
          )
          .run({ silenceTimeout: true })
      })
    })

    describe('when sending a valid cheque', () => {
      it('should complete the flow doing the consume, deploy and update the item curations steps', () => {
        const parsedSignature = ethers.utils.splitSignature(cheque.signature)
        const merkleTree = generateTree(Object.values(contentHashes))
        return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
          .provide([
            [call([mockBuilder, 'fetchApprovalData'], TPCollection.id), { cheque, content_hashes: contentHashes }],
            [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
            [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
            [
              call(buildTPItemEntity, mockCatalyst, TPCollection, itemsToApprove[0], merkleTree, contentHashes[itemsToApprove[0].id]),
              deployData
            ],
            [
              call(buildTPItemEntity, mockCatalyst, TPCollection, itemsToApprove[1], merkleTree, contentHashes[itemsToApprove[1].id]),
              deployData
            ],
            [call([mockBuilder, 'updateItemCurationStatus'], itemsToApprove[0].id, CurationStatus.APPROVED), {}],
            [call([mockBuilder, 'updateItemCurationStatus'], itemsToApprove[1].id, CurationStatus.APPROVED), {}]
          ])
          .dispatch(initiateTPApprovalFlow(TPCollection, itemsToApprove))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.LOADING,
              collection: TPCollection
            } as ApprovalFlowModalMetadata)
          )
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.CONSUME_TP_SLOTS,
              items: itemsToApprove,
              collection: TPCollection,
              merkleTreeRoot: merkleTree.merkleRoot,
              slots: [{ qty: cheque.qty, salt: cheque.salt, sigR: parsedSignature.r, sigS: parsedSignature.s, sigV: parsedSignature.v }]
            } as ApprovalFlowModalMetadata<ApprovalFlowModalView.CONSUME_TP_SLOTS>)
          )
          .dispatch(consumeThirdPartyItemSlotsSuccess())
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.DEPLOY,
              collection: TPCollection,
              items: [unsyncedItem],
              entities: [deployData]
            } as ApprovalFlowModalMetadata)
          )
          .dispatch(deployEntitiesSuccess([deployData]))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.SUCCESS,
              collection: TPCollection
            } as ApprovalFlowModalMetadata)
          )
          .run({ silenceTimeout: true })
      })

      describe('when the consume slots transaction fails', () => {
        it('should open the modal in an error state', () => {
          const consumeSlotsError = 'Error when consuming slots'
          const parsedSignature = ethers.utils.splitSignature(cheque.signature)
          const merkleTree = generateTree(Object.values(contentHashes))
          return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
            .provide([
              [call([mockBuilder, 'fetchApprovalData'], TPCollection.id), { cheque, content_hashes: contentHashes }],
              [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
              [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }]
            ])
            .dispatch(initiateTPApprovalFlow(TPCollection, itemsToApprove))
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.LOADING,
                collection: TPCollection
              } as ApprovalFlowModalMetadata)
            )
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.CONSUME_TP_SLOTS,
                items: itemsToApprove,
                collection: TPCollection,
                merkleTreeRoot: merkleTree.merkleRoot,
                slots: [{ qty: cheque.qty, salt: cheque.salt, sigR: parsedSignature.r, sigS: parsedSignature.s, sigV: parsedSignature.v }]
              } as ApprovalFlowModalMetadata<ApprovalFlowModalView.CONSUME_TP_SLOTS>)
            )
            .dispatch(consumeThirdPartyItemSlotsFailure(consumeSlotsError))
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.ERROR,
                collection: TPCollection,
                error: consumeSlotsError
              } as ApprovalFlowModalMetadata)
            )
            .run({ silenceTimeout: true })
        })
      })

      describe('when the deployment to the catalyst fails', () => {
        it('should open the modal in an error state', () => {
          const merkleTree = generateTree(Object.values(contentHashes))
          const parsedSignature = ethers.utils.splitSignature(cheque.signature)
          const deployError = 'Deployment Error'
          return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
            .provide([
              [call([mockBuilder, 'fetchApprovalData'], TPCollection.id), { cheque, content_hashes: contentHashes }],
              [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
              [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
              [
                call(buildTPItemEntity, mockCatalyst, TPCollection, itemsToApprove[0], merkleTree, contentHashes[itemsToApprove[0].id]),
                deployData
              ],
              [
                call(buildTPItemEntity, mockCatalyst, TPCollection, itemsToApprove[1], merkleTree, contentHashes[itemsToApprove[1].id]),
                deployData
              ]
            ])
            .dispatch(initiateTPApprovalFlow(TPCollection, itemsToApprove))
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.LOADING,
                collection: TPCollection
              } as ApprovalFlowModalMetadata)
            )
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.CONSUME_TP_SLOTS,
                items: itemsToApprove,
                collection: TPCollection,
                merkleTreeRoot: merkleTree.merkleRoot,
                slots: [{ qty: cheque.qty, salt: cheque.salt, sigR: parsedSignature.r, sigS: parsedSignature.s, sigV: parsedSignature.v }]
              } as ApprovalFlowModalMetadata<ApprovalFlowModalView.CONSUME_TP_SLOTS>)
            )
            .dispatch(consumeThirdPartyItemSlotsSuccess())
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.DEPLOY,
                collection: TPCollection,
                items: [unsyncedItem],
                entities: [deployData]
              } as ApprovalFlowModalMetadata)
            )
            .dispatch(deployEntitiesFailure([deployData], deployError))
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.ERROR,
                collection: TPCollection,
                error: deployError
              } as ApprovalFlowModalMetadata)
            )
            .run({ silenceTimeout: true })
        })
      })
    })
  })
})
