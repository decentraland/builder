import { call, select, delay } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import { ChainId, WearableRepresentation } from '@dcl/schemas'
import { EntityType } from 'dcl-catalyst-commons'
import { CatalystClient, DeploymentPreparationData, DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
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
import { approveCollectionFailure, approveCollectionSuccess, initiateApprovalFlow } from './actions'
import { collectionSaga } from './sagas'
import { Collection } from './types'

const mockBuilder = ({} as unknown) as BuilderAPI
const mockCatalyst = ({} as unknown) as CatalystClient

const collection = { id: 'aCollection', isPublished: true, isApproved: false } as Collection
const unsyncedItem = {
  id: 'anItem',
  collectionId: 'aCollection',
  name: 'An Item',
  description: 'This is an item',
  contentHash: 'QmUnsynced',
  contents: { 'thumbnail.png': 'QmNewHash' } as Record<string, string>,
  data: {
    category: WearableCategory.HAT,
    hides: [] as WearableCategory[],
    replaces: [] as WearableCategory[],
    tags: [] as string[],
    representations: [] as WearableRepresentation[]
  }
} as Item
const syncedItem = {
  id: 'anotherItem',
  collectionId: 'aCollection',
  name: 'Another Item',
  description: 'This is another item',
  contentHash: 'QmSynced',
  contents: { 'thumbnail.png': 'QmSameHash' } as Record<string, string>,
  data: {
    category: WearableCategory.HAT,
    hides: [] as WearableCategory[],
    replaces: [] as WearableCategory[],
    tags: [] as string[],
    representations: [] as WearableRepresentation[]
  }
} as Item
const items = [unsyncedItem, syncedItem]
const unsyncedEntity: DeploymentWithMetadataContentAndPointers = {
  entityId: 'anEntity',
  content: [{ key: 'thumbnail.png', hash: 'QmOldHash' }],
  metadata: {
    urn: 'urn:decentraland:collections-v2:aCollection:anItem',
    name: unsyncedItem.name,
    description: unsyncedItem.description,
    data: unsyncedItem.data
  },
  deployedBy: '0xcafebabe',
  entityTimestamp: 0,
  entityType: EntityType.WEARABLE,
  pointers: ['urn:decentraland:collections-v2:aCollection:anItem']
}
const syncedEntity: DeploymentWithMetadataContentAndPointers = {
  entityId: 'anEntity',
  content: [{ key: 'thumbnail.png', hash: 'QmSameHash' }],
  metadata: {
    urn: 'urn:decentraland:collections-v2:aCollection:anotherItem',
    name: syncedItem.name,
    description: syncedItem.description,
    data: syncedItem.data
  },
  deployedBy: '0xcafebabe',
  entityTimestamp: 0,
  entityType: EntityType.WEARABLE,
  pointers: ['urn:decentraland:collections-v2:aCollection:anotherItem']
}
const entitiesByItemId: Record<string, DeploymentWithMetadataContentAndPointers> = {
  [unsyncedItem.id]: unsyncedEntity,
  [syncedItem.id]: syncedEntity
}
const entityToDeploy: DeploymentPreparationData = { entityId: 'QmNewEntityId', files: new Map() }

const newContentHash = 'QmNewHash'
const updatedItem = { ...unsyncedItem, contentHash: newContentHash }
const curation = { id: 'aCuration', collectionId: collection.id, status: CurationStatus.PENDING } as Curation

describe('when executing the approval flow', () => {
  describe('when a collection is not published', () => {
    it('should open the modal in an error state', () => {
      const unpublishedCollection = { ...collection, isPublished: false }
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .dispatch(initiateApprovalFlow(unpublishedCollection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection: unpublishedCollection,
            error: `The collection can't be approved because it's not published`
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })
  describe('when a collection has not been approved yet', () => {
    it('should complete the flow doing the rescue, deploy and approve collection steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), items],
          [call(buildItemContentHash, collection, unsyncedItem), newContentHash],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getItems), items],
          [select(getEntityByItemId), entitiesByItemId],
          [call(buildItemEntity, mockCatalyst, collection, unsyncedItem), entityToDeploy]
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
            contentHashes: [newContentHash]
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
            entities: [entityToDeploy]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([entityToDeploy]))
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
    it('should complete the flow doing a rescue, deploy and approve curation steps', () => {
      const approvedCollection = { ...collection, isApproved: true }
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), items],
          [call(buildItemContentHash, approvedCollection, unsyncedItem), newContentHash],
          [call(buildItemContentHash, approvedCollection, syncedItem), syncedItem.contentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getItems), items],
          [select(getEntityByItemId), entitiesByItemId],
          [call(buildItemEntity, mockCatalyst, approvedCollection, unsyncedItem), entityToDeploy],
          [select(getCurationsByCollectionId), { [approvedCollection.id]: curation }]
        ])
        .dispatch(initiateApprovalFlow(approvedCollection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection: approvedCollection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.RESCUE,
            collection: approvedCollection,
            items: [unsyncedItem],
            contentHashes: [newContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(approvedCollection, [updatedItem], [updatedItem.contentHash], ChainId.MATIC_MAINNET, '0xhash'))
        .put(fetchItemsRequest())
        .dispatch(fetchItemsSuccess([syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection: approvedCollection,
            items: [unsyncedItem],
            entities: [entityToDeploy]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([entityToDeploy]))
        .put(approveCurationRequest(approvedCollection.id))
        .dispatch(approveCurationSuccess(approvedCollection.id))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.SUCCESS,
            collection: approvedCollection
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })
  describe('when a collection has already the same content hashes in the DB and in the blockchain, the entities are synced with the ones in the catalyst, the collection is approved and there are no pending curations', () => {
    it('should skip all the unnecessary steps', () => {
      const syncedItems = [syncedItem, { ...syncedItem, id: unsyncedItem.id }]
      const syncedEntitiesById: Record<string, DeploymentWithMetadataContentAndPointers> = {
        [unsyncedItem.id]: syncedEntity,
        [syncedItem.id]: syncedEntity
      }
      const approvedCollection = { ...collection, isApproved: true }
      const approvedCuration = { ...curation, status: CurationStatus.APPROVED } as Curation
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), syncedItems],
          [call(buildItemContentHash, approvedCollection, syncedItems[0]), syncedItem.contentHash],
          [call(buildItemContentHash, approvedCollection, syncedItems[1]), syncedItem.contentHash],
          [select(getItems), syncedItems],
          [select(getEntityByItemId), syncedEntitiesById],
          [select(getCurationsByCollectionId), { [approvedCollection.id]: approvedCuration }]
        ])
        .dispatch(initiateApprovalFlow(approvedCollection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection: approvedCollection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.SUCCESS,
            collection: approvedCollection
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })
  describe('when the rescue transaction fails', () => {
    it('should open the modal in an error state', () => {
      const rescueError = 'Rescue Transaction Error'
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), items],
          [call(buildItemContentHash, collection, unsyncedItem), newContentHash],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash]
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
            contentHashes: [newContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsFailure(collection, [unsyncedItem], [newContentHash], rescueError))
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
    it('should open the modal in an error state', () => {
      const deployError = 'Deployment Error'
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), items],
          [call(buildItemContentHash, collection, unsyncedItem), newContentHash],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getItems), items],
          [select(getEntityByItemId), entitiesByItemId],
          [call(buildItemEntity, mockCatalyst, collection, unsyncedItem), entityToDeploy]
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
            contentHashes: [newContentHash]
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
            entities: [entityToDeploy]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesFailure([entityToDeploy], deployError))
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
    it('should open the modal in an error state', () => {
      const approveError = 'Approve Collection Transaction Error'
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), items],
          [call(buildItemContentHash, collection, unsyncedItem), newContentHash],
          [call(buildItemContentHash, collection, syncedItem), syncedItem.contentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getItems), items],
          [select(getEntityByItemId), entitiesByItemId],
          [call(buildItemEntity, mockCatalyst, collection, unsyncedItem), entityToDeploy]
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
            contentHashes: [newContentHash]
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
            entities: [entityToDeploy]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([entityToDeploy]))
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
    it('should open the modal in an error state', () => {
      const approvedCollection = { ...collection, isApproved: true }
      const curationError = 'Curation Error'
      return expectSaga(collectionSaga, mockBuilder, mockCatalyst)
        .provide([
          [select(getItems), items],
          [call(buildItemContentHash, approvedCollection, unsyncedItem), newContentHash],
          [call(buildItemContentHash, approvedCollection, syncedItem), syncedItem.contentHash],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getItems), items],
          [select(getEntityByItemId), entitiesByItemId],
          [call(buildItemEntity, mockCatalyst, approvedCollection, unsyncedItem), entityToDeploy],
          [select(getCurationsByCollectionId), { [approvedCollection.id]: curation }]
        ])
        .dispatch(initiateApprovalFlow(approvedCollection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection: approvedCollection
          } as ApprovalFlowModalMetadata)
        )
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.RESCUE,
            collection: approvedCollection,
            items: [unsyncedItem],
            contentHashes: [newContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(approvedCollection, [updatedItem], [updatedItem.contentHash], ChainId.MATIC_MAINNET, '0xhash'))
        .put(fetchItemsRequest())
        .dispatch(fetchItemsSuccess([syncedItem, updatedItem]))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.DEPLOY,
            collection: approvedCollection,
            items: [unsyncedItem],
            entities: [entityToDeploy]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(deployEntitiesSuccess([entityToDeploy]))
        .put(approveCurationRequest(approvedCollection.id))
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
})
