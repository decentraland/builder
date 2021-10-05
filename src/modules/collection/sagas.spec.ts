import { retry, race, take, put, call, select, delay } from 'redux-saga/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { replace } from 'connected-react-router'
import { ChainId, Network, WearableRepresentation } from '@dcl/schemas'
import { EntityType } from 'dcl-catalyst-commons'
import { CatalystClient, DeploymentPreparationData, DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { locations } from 'routing/locations'
import { ApprovalFlowModalMetadata, ApprovalFlowModalView } from 'components/Modals/ApprovalFlowModal/ApprovalFlowModal.types'
import { buildItemContentHash, buildItemEntity } from 'modules/item/export'
import { getEntityByItemId, getItems, getData as getItemsById } from 'modules/item/selectors'
import { Item, WearableCategory } from 'modules/item/types'
import { openModal } from 'modules/modal/actions'
import { fetchItemsRequest, fetchItemsSuccess, rescueItemsFailure, rescueItemsSuccess } from 'modules/item/actions'
import { deployEntitiesFailure, deployEntitiesSuccess } from 'modules/entity/actions'
import { approveCurationFailure, approveCurationRequest, approveCurationSuccess } from 'modules/curation/actions'
import { getCurationsByCollectionId } from 'modules/curation/selectors'
import { Curation, CurationStatus } from 'modules/curation/types'
import { BuilderAPI } from 'lib/api/builder'
import {
  approveCollectionFailure,
  approveCollectionSuccess,
  initiateApprovalFlow,
  saveCollectionRequest,
  saveCollectionSuccess,
  publishCollectionRequest,
  publishCollectionSuccess,
  SAVE_COLLECTION_SUCCESS,
  SAVE_COLLECTION_FAILURE
} from './actions'
import { collectionSaga } from './sagas'
import { Collection } from './types'

const mockBuilder = ({} as unknown) as BuilderAPI
const mockCatalyst = ({} as unknown) as CatalystClient

const getCollection = (props: Partial<Collection> = {}): Collection =>
  ({ id: 'aCollection', isPublished: true, isApproved: false, ...props } as Collection)

const getItem = (collection: Collection, props: Partial<Item> = {}): Item =>
  ({
    id: 'anItem',
    collectionId: collection.id,
    name: 'An Item',
    description: 'This is an item',
    contentHash: 'QmSynced',
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

const getEntity = (
  item: Item,
  props: Partial<DeploymentWithMetadataContentAndPointers> = {}
): DeploymentWithMetadataContentAndPointers => ({
  entityId: 'anEntity',
  content: Object.keys(item.contents).map(key => ({ key, hash: item.contents[key] })),
  metadata: {
    urn: 'urn:decentraland:collections-v2:aCollection:anItem',
    name: item.name,
    description: item.description,
    data: item.data
  },
  deployedBy: '0xcafebabe',
  entityTimestamp: 0,
  entityType: EntityType.WEARABLE,
  pointers: ['urn:decentraland:collections-v2:aCollection:anItem'],
  ...props
})

const getDeployData = (): DeploymentPreparationData => ({ entityId: 'QmNewEntityId', files: new Map() })

const getCuration = (collection: Collection, props: Partial<Curation> = {}): Curation =>
  ({
    id: 'aCuration',
    collectionId: collection.id,
    status: CurationStatus.PENDING,
    ...props
  } as Curation)

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
      contentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem = {
      ...unsyncedItem,
      contentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ key: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    it('should complete the flow doing the rescue, deploy and approve collection steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [call(buildItemContentHash, collection, unsyncedItem), updatedItem.contentHash],
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
            contentHashes: [updatedItem.contentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.contentHash], ChainId.MATIC_MAINNET, '0xhash'))
        .put(fetchItemsRequest())
        .dispatch(fetchItemsSuccess([syncedItem, updatedItem]))
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
      contentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem = {
      ...unsyncedItem,
      contentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ key: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    const curation = getCuration(collection)
    it('should complete the flow doing a rescue, deploy and approve curation steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [call(buildItemContentHash, collection, unsyncedItem), updatedItem.contentHash],
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
            contentHashes: [updatedItem.contentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.contentHash], ChainId.MATIC_MAINNET, '0xhash'))
        .put(fetchItemsRequest())
        .dispatch(fetchItemsSuccess([syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection,
            items: [unsyncedItem],
            entities: [deployData]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([deployData]))
        .put(approveCurationRequest(collection.id))
        .dispatch(approveCurationSuccess(collection.id))
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
          [call(buildItemContentHash, collection, items[0]), items[0].contentHash],
          [call(buildItemContentHash, collection, items[1]), items[1].contentHash],
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
      contentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem = {
      ...unsyncedItem,
      contentHash: 'QmNewContentHash'
    }
    const rescueError = 'Rescue Transaction Error'
    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [call(buildItemContentHash, collection, unsyncedItem), updatedItem.contentHash]
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
            contentHashes: [updatedItem.contentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsFailure(collection, [unsyncedItem], [updatedItem.contentHash], rescueError))
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
      contentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem = {
      ...unsyncedItem,
      contentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ key: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    const deployError = 'Deployment Error'
    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [call(buildItemContentHash, collection, unsyncedItem), updatedItem.contentHash],
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
            contentHashes: [updatedItem.contentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.contentHash], ChainId.MATIC_MAINNET, '0xhash'))
        .put(fetchItemsRequest())
        .dispatch(fetchItemsSuccess([syncedItem, updatedItem]))
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
      contentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem = {
      ...unsyncedItem,
      contentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ key: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    const approveError = 'Approve Collection Transaction Error'
    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [call(buildItemContentHash, collection, unsyncedItem), updatedItem.contentHash],
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
            contentHashes: [updatedItem.contentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.contentHash], ChainId.MATIC_MAINNET, '0xhash'))
        .put(fetchItemsRequest())
        .dispatch(fetchItemsSuccess([syncedItem, updatedItem]))
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
      contentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem = {
      ...unsyncedItem,
      contentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntity(syncedItem)
    const unsyncedEntity = getEntity(updatedItem, { content: [{ key: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployData()
    const curation = getCuration(collection)
    const curationError = 'Curation Error'
    it('should open the modal in an error state', () => {
      const approvedCollection = { ...collection, isApproved: true }
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [call(buildItemContentHash, collection, unsyncedItem), updatedItem.contentHash],
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
            contentHashes: [updatedItem.contentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.contentHash], ChainId.MATIC_MAINNET, '0xhash'))
        .put(fetchItemsRequest())
        .dispatch(fetchItemsSuccess([syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection,
            items: [unsyncedItem],
            entities: [deployData]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([deployData]))
        .put(approveCurationRequest(collection.id))
        .dispatch(approveCurationFailure(approvedCollection.id, curationError))
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
    const builderAPI = ({
      saveCollection: jest.fn(),
      lockCollection: jest.fn(),
      saveTOS: jest.fn()
    } as unknown) as BuilderAPI

    const collection = {
      salt: 'some salt'
    } as Collection
    const items: Item[] = []
    const email = 'email@domain.com'

    const address = '0xa'
    const txHash = '0xdeadbeef'

    describe('when the transaction is sent correctly', () => {
      it('should disptach a success with the new collection and redirect to the activity', () => {
        const now = Date.now()
        const newLock = new Date(Date.now())
        const newCollection = { ...collection, lock: now }

        return expectSaga(collectionSaga, builderAPI, mockCatalyst)
          .provide([
            [put(saveCollectionRequest(collection)), true],
            [
              race({
                success: take(SAVE_COLLECTION_SUCCESS),
                failure: take(SAVE_COLLECTION_FAILURE)
              }),
              { success: saveCollectionSuccess(collection) }
            ],
            [call(t, 'sagas.item.missing_salt'), 'Missing salt'],
            [select(getAddress), [address]],
            [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MAINNET],
            [retry(10, 500, builderAPI.lockCollection, collection), newLock],
            [retry(10, 500, builderAPI.saveTOS, collection, email), undefined],
            [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
          ])
          .put(saveCollectionRequest(collection))
          .put(publishCollectionSuccess(newCollection, items, ChainId.MATIC_MAINNET, txHash))
          .put(replace(locations.activity()))
          .dispatch(publishCollectionRequest(collection, items, email))
          .run({ silenceTimeout: true })
      })
    })
  })
})
