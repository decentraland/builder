import { ethers } from 'ethers'
import { retry, race, take, call, put, select, delay, getContext } from 'redux-saga/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { generateTree } from '@dcl/content-hash-tree'
import { BuilderClient } from '@dcl/builder-client'
import { ChainId, Network, WearableCategory, WearableRepresentation, Entity, EntityType } from '@dcl/schemas'
import { DeploymentPreparationData } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { sendTransaction } from 'decentraland-dapps/dist/modules/wallet/utils'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'
import { config } from 'config'
import { locations } from 'routing/locations'
import { ApprovalFlowModalMetadata, ApprovalFlowModalView } from 'components/Modals/ApprovalFlowModal/ApprovalFlowModal.types'
import {
  getEntityByItemId,
  getItems,
  getData as getItemsById,
  getPaginationData,
  getWalletItems,
  getCollectionItems
} from 'modules/item/selectors'
import { getName } from 'modules/profile/selectors'
import { buildItemEntity, buildStandardWearableContentHash } from 'modules/item/export'
import { getCollection } from 'modules/collection/selectors'
import { EntityHashingType, Item, ItemApprovalData, ItemType, BlockchainRarity } from 'modules/item/types'
import { openModal, closeModal, CLOSE_MODAL } from 'decentraland-dapps/dist/modules/modal/actions'
import { mockedItem } from 'specs/item'
import {
  fetchCollectionItemsRequest,
  fetchCollectionItemsSuccess,
  rescueItemsFailure,
  rescueItemsSuccess,
  saveItemFailure,
  saveItemRequest,
  saveItemSuccess,
  saveMultipleItemsSuccess,
  SAVE_ITEM_FAILURE,
  SAVE_ITEM_SUCCESS,
  setItemsTokenIdRequest,
  fetchRaritiesRequest,
  FETCH_RARITIES_SUCCESS,
  FETCH_RARITIES_FAILURE,
  FetchRaritiesFailureAction,
  FetchRaritiesSuccessAction
} from 'modules/item/actions'
import { deployEntitiesFailure, deployEntitiesSuccess } from 'modules/entity/actions'
import {
  approveCollectionCurationFailure,
  approveCollectionCurationRequest,
  approveCollectionCurationSuccess
} from 'modules/curations/collectionCuration/actions'
import { EMPTY_ITEM_METRICS } from 'modules/item/utils'
import { getCurationsByCollectionId } from 'modules/curations/collectionCuration/selectors'
import {
  deployBatchedThirdPartyItemsFailure,
  deployBatchedThirdPartyItemsSuccess,
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE,
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS,
  reviewThirdPartyFailure,
  reviewThirdPartySuccess,
  REVIEW_THIRD_PARTY_FAILURE,
  REVIEW_THIRD_PARTY_SUCCESS
} from 'modules/thirdParty/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { subscribeToNewsletterRequest } from 'modules/newsletter/action'
import { Cheque } from 'modules/thirdParty/types'
import { CurationSortOptions, CurationStatus } from 'modules/curations/types'
import { BuilderAPI, FetchCollectionsParams, TermsOfServiceEvent } from 'lib/api/builder'
import { PaginatedResource, PaginationStats } from 'lib/api/pagination'
import { extractThirdPartyId } from 'lib/urn'
import {
  approveCollectionFailure,
  initiateApprovalFlow,
  saveCollectionRequest,
  saveCollectionSuccess,
  saveCollectionFailure,
  publishCollectionRequest,
  publishCollectionSuccess,
  publishCollectionFailure,
  SAVE_COLLECTION_SUCCESS,
  SAVE_COLLECTION_FAILURE,
  initiateTPApprovalFlow,
  fetchCollectionsRequest,
  fetchCollectionsSuccess,
  approveCollectionSuccess,
  deployMissingEntitiesRequest,
  deployMissingEntitiesSuccess,
  deployMissingEntitiesFailure
} from './actions'
import { collectionSaga } from './sagas'
import { Collection, PaymentMethod } from './types'
import { getData, getPaginationData as getCollectionPaginationData, getLastFetchParams } from './selectors'
import { CollectionPaginationData } from './reducer'
import { UNSYNCED_COLLECTION_ERROR_PREFIX } from './utils'

const getCollectionMock = (props: Partial<Collection> = {}): Collection =>
  ({ id: 'aCollection', isPublished: true, isApproved: false, ...props } as Collection)

const getTPCollectionMock = (props: Partial<Collection> = {}): Collection =>
  ({
    id: 'aCollection',
    isPublished: true,
    isApproved: false,
    urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:one-third-party-collection',
    ...props
  } as Collection)

const getItemMock = (collection: Collection, props: Partial<Item> = {}): Item =>
  ({
    id: 'anItem',
    type: ItemType.WEARABLE,
    collectionId: collection.id,
    name: 'An Item',
    description: 'This is an item',
    currentContentHash: 'QmSynced',
    blockchainContentHash: 'QmSynced',
    catalystContentHash: 'QmSynced',
    contents: { 'thumbnail.png': 'QmThumbnailHash' } as Record<string, string>,
    tokenId: 'tokenId',
    data: {
      category: WearableCategory.HAT,
      hides: [] as WearableCategory[],
      replaces: [] as WearableCategory[],
      tags: [] as string[],
      representations: [] as WearableRepresentation[]
    },
    metrics: EMPTY_ITEM_METRICS,
    ...props
  } as Item)

const getEntityMock = (item: Item, props: Partial<Entity> = {}): Entity => ({
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
  version: 'v3',
  ...props
})

const getDeployDataMock = (): DeploymentPreparationData => ({ entityId: 'QmNewEntityId', files: new Map() })

const getCollectionCuration = (collection: Collection, props: Partial<CollectionCuration> = {}): CollectionCuration =>
  ({
    id: 'aCollectionCuration',
    collectionId: collection.id,
    status: CurationStatus.PENDING,
    ...props
  } as CollectionCuration)

const getPaginationDataMock = (): PaginationStats => ({
  limit: 1,
  page: 1,
  pages: 1,
  total: 1
})

const getItemCurationMock = (item: Item, props: Partial<ItemCuration> = {}): ItemCuration =>
  ({
    id: 'anItemCuration',
    itemId: item.id,
    status: CurationStatus.PENDING,
    ...props
  } as ItemCuration)

let mockBuilder: BuilderAPI
let mockBuilderClient: BuilderClient

beforeEach(() => {
  mockBuilder = {
    saveCollection: jest.fn(),
    lockCollection: jest.fn(),
    saveTOS: jest.fn(),
    fetchApprovalData: jest.fn(),
    fetchCollectionItems: jest.fn(),
    fetchCollections: jest.fn()
  } as unknown as BuilderAPI
  mockBuilderClient = {
    getThirdParty: jest.fn()
  } as unknown as BuilderClient
})

describe('when executing the approval flow', () => {
  describe('when a collection is not published', () => {
    it('should open the modal in an error state', () => {
      const collection = getCollectionMock({ isPublished: false })
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection,
            error: "The collection can't be approved because it's not published"
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when an item in the collection does not have the token id', () => {
    it('should dispatch an action to set the token id', async () => {
      const collection = getCollectionMock({})
      const item1 = getItemMock(collection)
      const item2 = getItemMock(collection, { tokenId: undefined })

      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([[select(getItems), [item1, item2]]])
        .dispatch(initiateApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.LOADING,
            collection
          } as ApprovalFlowModalMetadata)
        )
        .put(setItemsTokenIdRequest(collection, [item1, item2]))
        .run({ silenceTimeout: true })
    })
  })

  describe("when there are items in the collection that don't have current content hash", () => {
    let collection: Collection
    let item: Item
    let entity: Entity
    let curation: CollectionCuration

    beforeEach(() => {
      collection = getCollectionMock({ isApproved: true })
      curation = getCollectionCuration(collection, { status: CurationStatus.APPROVED })
    })

    describe("and the item entity hashed with the v0 and the v1 algorithm doesn't match the one in the blockchain", () => {
      let paginatedData: PaginatedResource<Item>
      let updatedItem: Item
      let newBlockchainHash: string

      beforeEach(() => {
        newBlockchainHash = 'aNewHash'
        item = getItemMock(collection, {
          id: 'anotherItem',
          currentContentHash: null,
          blockchainContentHash: 'QmOldContentHash',
          contents: { 'thumbnail.png': 'QmOldThumbnailHash' }
        })
        updatedItem = { ...item, blockchainContentHash: newBlockchainHash }
        entity = getEntityMock(item, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
        paginatedData = {
          limit: 1,
          page: 1,
          pages: 1,
          results: [item],
          total: 1
        }
      })

      it('should rescue the item with the entity hashed using the v1 algorithm', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getItems), [item]],
            [
              select(getEntityByItemId),
              {
                [item.id]: entity
              }
            ],
            [call(buildStandardWearableContentHash, collection, item, EntityHashingType.V0), 'QmOldDifferentHash'],
            [call(buildStandardWearableContentHash, collection, item, EntityHashingType.V1), newBlockchainHash],
            [delay(1000), void 0],
            [select(getItemsById), { [updatedItem.id]: updatedItem }],
            [select(getCurationsByCollectionId), { [collection.id]: curation }],
            [select(getCollection, collection.id), { collection }]
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
              items: [item],
              contentHashes: [newBlockchainHash]
            } as ApprovalFlowModalMetadata)
          )
          .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.blockchainContentHash!], ChainId.MATIC_MAINNET, ['0xhash']))
          .put(fetchCollectionItemsRequest(collection.id))
          .dispatch(
            fetchCollectionItemsSuccess(collection.id, [updatedItem], {
              limit: paginatedData.limit,
              page: paginatedData.page,
              pages: paginatedData.pages,
              total: paginatedData.total
            })
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

    describe('and the item entity hashed with the v0 algorithm matches the one in the blockchain', () => {
      beforeEach(() => {
        item = getItemMock(collection, {
          id: 'anotherItem',
          currentContentHash: null,
          blockchainContentHash: 'QmOldContentHash',
          contents: { 'thumbnail.png': 'QmOldThumbnailHash' }
        })
        entity = getEntityMock(item, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
      })

      it('should skip the step to rescue the item', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getItems), [item]],
            [
              select(getEntityByItemId),
              {
                [item.id]: entity
              }
            ],
            [call(buildStandardWearableContentHash, collection, item, EntityHashingType.V0), 'QmOldContentHash'],
            [call(buildStandardWearableContentHash, collection, item, EntityHashingType.V1), 'aNewHash'],
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

    describe('and the item entity hashed with the v1 algorithm matches the one in the blockchain', () => {
      beforeEach(() => {
        item = getItemMock(collection, {
          id: 'anotherItem',
          currentContentHash: null,
          blockchainContentHash: 'QmOldContentHash',
          contents: { 'thumbnail.png': 'QmOldThumbnailHash' }
        })
        entity = getEntityMock(item, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
      })

      it('should skip the step to rescue the item', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getItems), [item]],
            [
              select(getEntityByItemId),
              {
                [item.id]: entity
              }
            ],
            [call(buildStandardWearableContentHash, collection, item, EntityHashingType.V0), 'QmOldContentHash'],
            [call(buildStandardWearableContentHash, collection, item, EntityHashingType.V1), 'aNewHash'],
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
  })

  describe('when a collection has not been approved yet', () => {
    const collection = getCollectionMock()
    const syncedItem = getItemMock(collection)
    const paginatedData: PaginatedResource<Item> = {
      limit: 1,
      page: 1,
      pages: 1,
      results: [syncedItem],
      total: 1
    }

    const unsyncedItem = getItemMock(collection, {
      id: 'anotherItem',
      currentContentHash: 'QmNewContentHash',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      currentContentHash: 'QmNewContentHash',
      blockchainContentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntityMock(syncedItem)
    const unsyncedEntity = getEntityMock(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployDataMock()

    it('should complete the flow doing the rescue, deploy and approve collection steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockBuilder, collection, unsyncedItem, undefined, undefined), deployData],
          [select(getCollection, collection.id), { collection }]
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
            contentHashes: [unsyncedItem.currentContentHash]
          } as ApprovalFlowModalMetadata)
        )
        .dispatch(rescueItemsSuccess(collection, [updatedItem], [updatedItem.blockchainContentHash!], ChainId.MATIC_MAINNET, ['0xhash']))
        .put(fetchCollectionItemsRequest(collection.id))
        .dispatch(
          fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem], {
            limit: paginatedData.limit,
            page: paginatedData.page,
            pages: paginatedData.pages,
            total: paginatedData.total
          })
        )
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
    const collection = getCollectionMock({ isApproved: true })
    const syncedItem = getItemMock(collection)
    const unsyncedItem = getItemMock(collection, {
      id: 'anotherItem',
      currentContentHash: 'QmNewContentHash',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const paginatedData: PaginatedResource<Item> = {
      limit: 1,
      page: 1,
      pages: 1,
      results: [syncedItem],
      total: 1
    }
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntityMock(syncedItem)
    const unsyncedEntity = getEntityMock(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployDataMock()
    const curation = getCollectionCuration(collection)

    it('should complete the flow doing a rescue, deploy and approve curation steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockBuilder, collection, unsyncedItem, undefined, undefined), deployData],
          [select(getCurationsByCollectionId), { [collection.id]: curation }],
          [select(getCollection, collection.id), { collection }]
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
        .dispatch(
          fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem], {
            limit: paginatedData.limit,
            page: paginatedData.page,
            pages: paginatedData.pages,
            total: paginatedData.total
          })
        )
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
    const collection = getCollectionMock({ isApproved: true })
    const items = [getItemMock(collection), getItemMock(collection, { id: 'anotherItem' })]
    const entities = [getEntityMock(items[0]), getEntityMock(items[1])]
    const curation = getCollectionCuration(collection, { status: CurationStatus.APPROVED })

    it('should skip all the unnecessary steps', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getItems), items],
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
    const collection = getCollectionMock({ isApproved: true })
    const syncedItem = getItemMock(collection)
    const unsyncedItem = getItemMock(collection, {
      id: 'anotherItem',
      currentContentHash: 'QmNewContentHash',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const rescueError = 'Rescue Transaction Error'

    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([[select(getItems), [syncedItem, unsyncedItem]]])
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
    const collection = getCollectionMock()
    const syncedItem = getItemMock(collection)
    const unsyncedItem = getItemMock(collection, {
      id: 'anotherItem',
      currentContentHash: 'QmNewContentHash',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const paginatedData: PaginatedResource<Item> = {
      limit: 1,
      page: 1,
      pages: 1,
      results: [syncedItem],
      total: 1
    }
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const syncedEntity = getEntityMock(syncedItem)
    const unsyncedEntity = getEntityMock(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployDataMock()
    const deployError = 'Deployment Error'

    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockBuilder, collection, unsyncedItem, undefined, undefined), deployData],
          [select(getCollection, collection.id), { collection }]
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
        .dispatch(
          fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem], {
            limit: paginatedData.limit,
            page: paginatedData.page,
            pages: paginatedData.pages,
            total: paginatedData.total
          })
        )
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
    const collection = getCollectionMock()
    const syncedItem = getItemMock(collection)
    const unsyncedItem = getItemMock(collection, {
      id: 'anotherItem',
      currentContentHash: 'QmNewContentHash',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const paginatedData: PaginatedResource<Item> = {
      limit: 1,
      page: 1,
      pages: 1,
      results: [syncedItem],
      total: 1
    }
    const syncedEntity = getEntityMock(syncedItem)
    const unsyncedEntity = getEntityMock(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployDataMock()
    const approveError = 'Approve Collection Transaction Error'

    it('should open the modal in an error state', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockBuilder, collection, unsyncedItem, undefined, undefined), deployData],
          [select(getCollection, collection.id), { collection }]
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
        .dispatch(
          fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem], {
            limit: paginatedData.limit,
            page: paginatedData.page,
            pages: paginatedData.pages,
            total: paginatedData.total
          })
        )
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
    const collection = getCollectionMock({ isApproved: true })
    const syncedItem = getItemMock(collection)
    const unsyncedItem = getItemMock(collection, {
      id: 'anotherItem',
      currentContentHash: 'QmNewContentHash',
      blockchainContentHash: 'QmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    const updatedItem: Item = {
      ...unsyncedItem,
      blockchainContentHash: 'QmNewContentHash'
    }
    const paginatedData: PaginatedResource<Item> = {
      limit: 1,
      page: 1,
      pages: 1,
      results: [syncedItem],
      total: 1
    }
    const syncedEntity = getEntityMock(syncedItem)
    const unsyncedEntity = getEntityMock(updatedItem, { content: [{ file: 'thumbnail.png', hash: 'QmOldThumbnailHash' }] })
    const deployData = getDeployDataMock()
    const curation = getCollectionCuration(collection)
    const curationError = 'CollectionCuration Error'

    it('should open the modal in an error state', () => {
      const approvedCollection = { ...collection, isApproved: true }
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getItems), [syncedItem, unsyncedItem]],
          [delay(1000), void 0],
          [select(getItemsById), { [syncedItem.id]: syncedItem, [unsyncedItem.id]: updatedItem }],
          [select(getEntityByItemId), { [syncedItem.id]: syncedEntity, [updatedItem.id]: unsyncedEntity }],
          [call(buildItemEntity, mockBuilder, collection, unsyncedItem, undefined, undefined), deployData],
          [select(getCurationsByCollectionId), { [collection.id]: curation }],
          [select(getCollection, collection.id), { collection }]
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
        .dispatch(
          fetchCollectionItemsSuccess(collection.id, [syncedItem, updatedItem], {
            limit: paginatedData.limit,
            page: paginatedData.page,
            pages: paginatedData.pages,
            total: paginatedData.total
          })
        )
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
})

describe('when publishing a collection', () => {
  let collection: Collection
  let items: Item[]
  const email = 'email@domain.com'

  const address = '0xa'
  const txHash = '0xdeadbeef'

  beforeEach(() => {
    collection = { salt: 'some salt', id: 'someId', name: 'name' } as Collection
    items = []
  })

  describe('when saving the collection fails', () => {
    let errorMessage: string
    beforeEach(() => {
      errorMessage = 'Error saving the collection'
    })

    it('should dispatch a failure action', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [put(saveCollectionRequest(collection)), true],
          [
            race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
            { failure: saveCollectionFailure(collection, errorMessage) }
          ]
        ])
        .put(saveCollectionRequest(collection))
        .put(publishCollectionFailure(collection, items, errorMessage, false))
        .dispatch(publishCollectionRequest(collection, items, email, false, PaymentMethod.MANA))
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
      ;(mockBuilder.fetchCollectionItems as jest.Mock).mockResolvedValue([])
    })

    it('should skip saving the collection', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getAddress), [address]],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [retry(10, 500, mockBuilder.lockCollection, lockedCollection), newLock],
          [retry(10, 500, mockBuilder.saveTOS, TermsOfServiceEvent.PUBLISH_COLLECTION, lockedCollection, email), undefined],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .not.put(saveCollectionRequest(collection))
        .put(publishCollectionSuccess(finalCollection, items, ChainId.MATIC_MUMBAI, txHash, false))
        .dispatch(publishCollectionRequest(lockedCollection, items, email, false, PaymentMethod.MANA))
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
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [put(saveCollectionRequest(saltlessCollection)), true],
          [
            race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
            { success: saveCollectionSuccess(saltlessCollection) }
          ],
          [call(t, 'sagas.item.missing_salt'), errorMessage]
        ])
        .put(saveCollectionRequest(saltlessCollection))
        .put(publishCollectionFailure(saltlessCollection, items, errorMessage, false))
        .dispatch(publishCollectionRequest(saltlessCollection, items, email, false, PaymentMethod.MANA))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the provided items length does not match the length of server items', () => {
    let finalCollection: Collection
    beforeEach(() => {
      finalCollection = { ...collection, id: 'collection-id', lock: Date.now() + 1000 /* Will be locked */ }
    })

    it('should signal with a publish collection failure action with an unsynced collection error', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [put(saveCollectionRequest(collection)), true],
          [
            race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
            { success: saveCollectionSuccess(collection) }
          ],
          [call([mockBuilder, 'fetchCollectionItems'], finalCollection.id), [{}]]
        ])
        .put(publishCollectionFailure(finalCollection, items, `${UNSYNCED_COLLECTION_ERROR_PREFIX} Different items length`, false))
        .dispatch(publishCollectionRequest(finalCollection, items, email, false, PaymentMethod.MANA))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the provided items do not match the items found in the server', () => {
    let finalCollection: Collection

    beforeEach(() => {
      finalCollection = { ...collection, id: 'collection-id', lock: Date.now() + 1000 /* Will be locked */ }
      items = [{ id: 'item-id' }] as Item[]
    })

    it('should signal with a publish collection failure action with an unsynced collection error', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [put(saveCollectionRequest(collection)), true],
          [
            race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
            { success: saveCollectionSuccess(collection) }
          ],
          [call([mockBuilder, 'fetchCollectionItems'], finalCollection.id), [{ id: 'other-item-id' }]]
        ])
        .put(
          publishCollectionFailure(
            finalCollection,
            items,
            `${UNSYNCED_COLLECTION_ERROR_PREFIX} Item found in the server but not in the browser`,
            false
          )
        )
        .dispatch(publishCollectionRequest(finalCollection, items, email, false, PaymentMethod.MANA))
        .run({ silenceTimeout: true })
    })
  })

  describe('when the subscribe to newsletter flag is true', () => {
    let subscribeToNewsletter: boolean
    let items: Item[]

    beforeEach(() => {
      subscribeToNewsletter = true
    })

    describe('and the collection contains emotes and wearables', () => {
      beforeEach(() => {
        items = [getItemMock(collection), getItemMock(collection, { type: ItemType.EMOTE })]
      })
      it('should put the subscribe to newsletter request action with the right source', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .put(subscribeToNewsletterRequest(email, 'Builder Emotes & Wearables creator'))
          .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, PaymentMethod.MANA))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the collection contains only emotes', () => {
      beforeEach(() => {
        items = [getItemMock(collection, { type: ItemType.EMOTE }), getItemMock(collection, { type: ItemType.EMOTE })]
      })
      it('should put the subscribe to newsletter request action with the right source', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .put(subscribeToNewsletterRequest(email, 'Builder Emotes creator'))
          .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, PaymentMethod.MANA))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the collection contains only wearables', () => {
      beforeEach(() => {
        items = [getItemMock(collection), getItemMock(collection)]
      })
      it('should put the subscribe to newsletter request action with the right source', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .put(subscribeToNewsletterRequest(email, 'Builder Wearables creator'))
          .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, PaymentMethod.MANA))
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('when the subscribe to newsletter flag is false', () => {
    let subscribeToNewsletter: boolean

    beforeEach(() => {
      subscribeToNewsletter = false
    })

    it('should not put the subscribe to newsletter request action', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .not.put(subscribeToNewsletterRequest(email, 'Builder Wearable creator'))
        .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, PaymentMethod.MANA))
        .run({ silenceTimeout: true })
    })
  })

  describe('when there are items in the collection that have contents hashed with an old algorithm', () => {
    let newLock: Date
    let finalCollection: Collection

    beforeEach(() => {
      const now = Date.now()
      newLock = new Date(now)
      finalCollection = { ...collection, lock: now }

      items = [
        { ...mockedItem, id: 'fstItem', contents: { ...mockedItem.contents, 'aFile.png': 'QmOldHash' } },
        { ...mockedItem, id: 'sndItem', contents: { 'someFile.png': 'newHash' } }
      ]
    })

    it('should put an action to save each of the items that have contents hashed with an older version', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [put(saveCollectionRequest(collection)), true],
          [
            race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
            { success: saveCollectionSuccess(collection) }
          ],
          [call([mockBuilder, 'fetchCollectionItems'], collection.id), items],
          [race({ success: take(SAVE_ITEM_SUCCESS), failure: take(SAVE_ITEM_FAILURE) }), { success: saveItemSuccess(items[0], {}) }],
          [select(getAddress), [address]],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [retry(10, 500, mockBuilder.lockCollection, collection), newLock],
          [retry(10, 500, mockBuilder.saveTOS, TermsOfServiceEvent.PUBLISH_COLLECTION, collection, email), undefined],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .put(saveItemRequest(items[0], {}))
        .put(saveCollectionRequest(collection))
        .put(publishCollectionSuccess(finalCollection, items, ChainId.MATIC_MUMBAI, txHash, false))
        .dispatch(publishCollectionRequest(collection, items, email, false, PaymentMethod.MANA))
        .run({ silenceTimeout: true })
    })

    describe('and saving one of the items fails', () => {
      const error = 'Something went wrong'

      it('should put a publish collection failure with the error', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [put(saveCollectionRequest(collection)), true],
            [
              race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
              { success: saveCollectionSuccess(collection) }
            ],
            [call([mockBuilder, 'fetchCollectionItems'], collection.id), items],
            [
              race({ success: take(SAVE_ITEM_SUCCESS), failure: take(SAVE_ITEM_FAILURE) }),
              { failure: saveItemFailure(items[0], {}, error) }
            ]
          ])
          .put(saveItemRequest(items[0], {}))
          .put(publishCollectionFailure(collection, items, error, false))
          .dispatch(publishCollectionRequest(collection, items, email, false, PaymentMethod.MANA))
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('when the transaction is sent correctly', () => {
    let finalCollection: Collection
    let newLock: Date

    beforeEach(() => {
      const now = Date.now()
      newLock = new Date(now)
      finalCollection = { ...collection, lock: now }
      ;(mockBuilder.fetchCollectionItems as jest.Mock).mockResolvedValue([])
    })

    it('should lock the collection, send the TOS and dispatch a success with the new collection and redirect to the activity', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [put(saveCollectionRequest(collection)), true],
          [
            race({ success: take(SAVE_COLLECTION_SUCCESS), failure: take(SAVE_COLLECTION_FAILURE) }),
            { success: saveCollectionSuccess(collection) }
          ],
          [call([mockBuilder, 'fetchCollectionItems'], finalCollection.id), items],
          [select(getAddress), [address]],
          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
          [retry(10, 500, mockBuilder.lockCollection, collection), newLock],
          [retry(10, 500, mockBuilder.saveTOS, TermsOfServiceEvent.PUBLISH_COLLECTION, collection, email), undefined],
          [matchers.call.fn(sendTransaction), Promise.resolve(txHash)]
        ])
        .put(saveCollectionRequest(collection))
        .put(publishCollectionSuccess(finalCollection, items, ChainId.MATIC_MUMBAI, txHash, false))
        .dispatch(publishCollectionRequest(collection, items, email, false, PaymentMethod.MANA))
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
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
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
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
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
      const pushMock = jest.fn()
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [getContext('history'), { push: pushMock }],
          [select(getOpenModals), { CreateThirdPartyCollectionModal: true }],
          [call([mockBuilder, 'saveCollection'], thirdPartyCollection, ''), remoteCollection]
        ])
        .dispatch(saveCollectionRequest(thirdPartyCollection))
        .run({ silenceTimeout: true })
        .then(() => {
          expect(pushMock).toHaveBeenCalledWith(locations.thirdPartyCollectionDetail(thirdPartyCollection.id))
        })
    })

    it('should save the collection and close all related modals', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getOpenModals), {}],
          [call([mockBuilder, 'saveCollection'], thirdPartyCollection, ''), remoteCollection]
        ])
        .put(saveCollectionSuccess({ ...thirdPartyCollection, contractAddress: remoteCollection.contractAddress }))
        .put(closeModal('CreateCollectionModal'))
        .put(closeModal('CreateThirdPartyCollectionModal'))
        .put(closeModal('EditCollectionURNModal'))
        .put(closeModal('EditCollectionNameModal'))
        .dispatch(saveCollectionRequest(thirdPartyCollection))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when executing the TP approval flow', () => {
  let itemsToApprove: Item[]
  let itemCurations: ItemCuration[]
  let TPCollection: Collection
  let syncedItem: Item
  let unsyncedItem: Item
  let contentHashes: ItemApprovalData['content_hashes']
  let cheque: Cheque

  beforeEach(() => {
    TPCollection = getTPCollectionMock()
    syncedItem = getItemMock(TPCollection, { currentContentHash: 'QmSynced' })
    unsyncedItem = getItemMock(TPCollection, {
      id: 'anotherItem',
      catalystContentHash: 'QmOldContentHash',
      currentContentHash: 'notQmOldContentHash',
      contents: { 'thumbnail.png': 'QmNewThumbnailHash' }
    })
    contentHashes = { [syncedItem.id]: syncedItem.currentContentHash!, [unsyncedItem.id]: unsyncedItem.currentContentHash! }
    cheque = {
      qty: 2,
      salt: '0xsalt',
      signature:
        '0x0ba9770fd8778383f6d56faadc71e17b75f0d6e3ff0a408d5e6c4cee3bd70a16' +
        '3574da0ebfb1eaac261698b057b342e52ea53f85287272cea471a4cda41e3466' +
        '1b'
    }
  })

  describe('when a collection is not published', () => {
    it('should open the modal in an error state', () => {
      const collection = getTPCollectionMock({ isPublished: false })
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .dispatch(initiateTPApprovalFlow(collection))
        .put(
          openModal('ApprovalFlowModal', {
            view: ApprovalFlowModalView.ERROR,
            collection,
            error: "The collection can't be approved because it's not published"
          } as ApprovalFlowModalMetadata)
        )
        .run({ silenceTimeout: true })
    })
  })

  describe('when a collection has not been approved yet', () => {
    const defaultMerkleRoot = 'aMerkleRoot'
    const totalItems = 45
    let updatedItem: Item
    let deployData: DeploymentPreparationData

    beforeEach(() => {
      deployData = getDeployDataMock()
      updatedItem = {
        ...unsyncedItem,
        catalystContentHash: 'QmNewContentHash'
      }
    })

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
        itemsToApprove = [syncedItem, unsyncedItem]
        ;(mockBuilder.fetchCollectionItems as jest.Mock).mockResolvedValue({ results: itemsToApprove })
      })

      it('should throw an error if itemsToApprove length is different than the cheque qty', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getPaginationData, TPCollection.id), { total: totalItems }],
            [call([mockBuilder, 'fetchApprovalData'], TPCollection.id), { cheque, content_hashes: contentHashes, root: defaultMerkleRoot }]
          ])
          .dispatch(initiateTPApprovalFlow(TPCollection))
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

    describe('when the cheque was already consumed', () => {
      beforeEach(() => {
        itemsToApprove = [syncedItem, unsyncedItem]
        ;(mockBuilder.fetchCollectionItems as jest.Mock).mockResolvedValue({ results: itemsToApprove })
      })

      it('should complete the flow doing the review without a cheque, deploy and update the item curations steps', () => {
        const merkleTree = generateTree(Object.values(contentHashes))
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getPaginationData, TPCollection.id), { total: totalItems }],
            [
              call([mockBuilder, 'fetchApprovalData'], TPCollection.id),
              { cheque, content_hashes: contentHashes, chequeWasConsumed: true, root: defaultMerkleRoot }
            ],
            [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
            [
              race({
                success: take(REVIEW_THIRD_PARTY_SUCCESS),
                failure: take(REVIEW_THIRD_PARTY_FAILURE),
                cancel: take(CLOSE_MODAL)
              }),
              { success: {} }
            ],
            [
              race({
                success: take(DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS),
                failure: take(DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE),
                cancel: take(CLOSE_MODAL)
              }),
              { success: {} }
            ],
            [call([mockBuilderClient, 'getThirdParty'], extractThirdPartyId(TPCollection.urn)), { root: merkleTree.merkleRoot }]
          ])
          .dispatch(initiateTPApprovalFlow(TPCollection))
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
              slots: []
            } as ApprovalFlowModalMetadata<ApprovalFlowModalView.CONSUME_TP_SLOTS>)
          )
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.DEPLOY_TP,
              collection: TPCollection,
              items: itemsToApprove,
              hashes: contentHashes,
              tree: merkleTree
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
    })

    describe('when sending a valid cheque', () => {
      let secondPageItems: Item[]
      let allItemsToApprove: Item[]

      beforeEach(() => {
        secondPageItems = [getItemMock(TPCollection, { isApproved: true }), getItemMock(TPCollection, { isApproved: true })]
        allItemsToApprove = [syncedItem, unsyncedItem, ...secondPageItems]
        ;(mockBuilder.fetchCollectionItems as jest.Mock).mockResolvedValueOnce({ results: [syncedItem, unsyncedItem] })
        ;(mockBuilder.fetchCollectionItems as jest.Mock).mockResolvedValueOnce({
          results: secondPageItems
        })
        itemCurations = allItemsToApprove.map(item => getItemCurationMock(item))
      })

      it('should fetch all the items needed to be approved, including the 2nd page of the pagination', () => {
        const parsedSignature = ethers.utils.splitSignature(cheque.signature)
        const merkleTree = generateTree(Object.values(contentHashes))
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getPaginationData, TPCollection.id), { total: 80 }],
            [
              call([mockBuilder, 'fetchApprovalData'], TPCollection.id),
              { cheque, content_hashes: contentHashes, chequeWasConsumed: false, root: defaultMerkleRoot }
            ]
          ])
          .dispatch(initiateTPApprovalFlow(TPCollection))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.CONSUME_TP_SLOTS,
              items: allItemsToApprove,
              collection: TPCollection,
              merkleTreeRoot: merkleTree.merkleRoot,
              slots: [{ qty: cheque.qty, salt: cheque.salt, sigR: parsedSignature.r, sigS: parsedSignature.s, sigV: parsedSignature.v }]
            } as ApprovalFlowModalMetadata<ApprovalFlowModalView.CONSUME_TP_SLOTS>)
          )
          .run({ silenceTimeout: true })
      })

      it('should complete the flow doing the review, deploy and update the item curations steps', () => {
        const parsedSignature = ethers.utils.splitSignature(cheque.signature)
        const merkleTree = generateTree(Object.values(contentHashes))
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getPaginationData, TPCollection.id), { total: 80 }],
            [
              call([mockBuilder, 'fetchApprovalData'], TPCollection.id),
              { cheque, content_hashes: contentHashes, chequeWasConsumed: false, root: defaultMerkleRoot }
            ],
            [call([mockBuilderClient, 'getThirdParty'], extractThirdPartyId(TPCollection.urn)), { root: merkleTree.merkleRoot }]
          ])
          .dispatch(initiateTPApprovalFlow(TPCollection))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.LOADING,
              collection: TPCollection
            } as ApprovalFlowModalMetadata)
          )
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.CONSUME_TP_SLOTS,
              items: allItemsToApprove,
              collection: TPCollection,
              merkleTreeRoot: merkleTree.merkleRoot,
              slots: [{ qty: cheque.qty, salt: cheque.salt, sigR: parsedSignature.r, sigS: parsedSignature.s, sigV: parsedSignature.v }]
            } as ApprovalFlowModalMetadata<ApprovalFlowModalView.CONSUME_TP_SLOTS>)
          )
          .dispatch(reviewThirdPartySuccess())
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.DEPLOY_TP,
              collection: TPCollection,
              items: allItemsToApprove,
              tree: merkleTree,
              hashes: contentHashes
            } as ApprovalFlowModalMetadata)
          )
          .dispatch(deployBatchedThirdPartyItemsSuccess(TPCollection, itemCurations))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.SUCCESS,
              collection: TPCollection
            } as ApprovalFlowModalMetadata)
          )
          .run({ silenceTimeout: true })
      })

      describe('when fetching the third party to check if the merkle root is updated takes more than one retry', () => {
        let merkleTree: ReturnType<typeof generateTree>
        let parsedSignature: ReturnType<typeof ethers.utils.splitSignature>

        beforeEach(() => {
          merkleTree = generateTree(Object.values(contentHashes))
          parsedSignature = ethers.utils.splitSignature(cheque.signature)
          ;(mockBuilderClient.getThirdParty as unknown as jest.Mock<BuilderClient['getThirdParty']>)
            .mockResolvedValueOnce({ root: '0x' } as never)
            .mockResolvedValueOnce({ root: merkleTree.merkleRoot } as never)
          itemCurations = itemsToApprove.map(item => getItemCurationMock(item))
        })

        it('should complete the flow doing the review, waiting for the merkle root to be updated, deploy and update the item curations', () => {
          return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
            .provide([
              [select(getPaginationData, TPCollection.id), { total: totalItems }],
              [
                call([mockBuilder, 'fetchApprovalData'], TPCollection.id),
                { cheque, content_hashes: contentHashes, chequeWasConsumed: false, root: defaultMerkleRoot }
              ],
              [delay(1000), 0]
            ])
            .dispatch(initiateTPApprovalFlow(TPCollection))
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
            .dispatch(reviewThirdPartySuccess())
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.DEPLOY_TP,
                collection: TPCollection,
                items: itemsToApprove,
                tree: merkleTree,
                hashes: contentHashes
              } as ApprovalFlowModalMetadata)
            )
            .dispatch(deployBatchedThirdPartyItemsSuccess(TPCollection, itemCurations))
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.SUCCESS,
                collection: TPCollection
              } as ApprovalFlowModalMetadata)
            )
            .run({ silenceTimeout: true })
        })
      })

      describe('when fetching the third party to check if the merkle root is updated, fails', () => {
        let merkleTree: ReturnType<typeof generateTree>
        let parsedSignature: ReturnType<typeof ethers.utils.splitSignature>
        let error: string

        beforeEach(() => {
          error = 'Third party retrieval error'
          parsedSignature = ethers.utils.splitSignature(cheque.signature)
          merkleTree = generateTree(Object.values(contentHashes))
        })

        it('should open the modal in an error state', () => {
          return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
            .provide([
              [select(getPaginationData, TPCollection.id), { total: totalItems }],
              [
                call([mockBuilder, 'fetchApprovalData'], TPCollection.id),
                { cheque, content_hashes: contentHashes, root: defaultMerkleRoot }
              ],
              [call([mockBuilderClient, 'getThirdParty'], extractThirdPartyId(TPCollection.urn)), Promise.reject(new Error(error))]
            ])
            .dispatch(initiateTPApprovalFlow(TPCollection))
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
            .dispatch(reviewThirdPartySuccess())
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.ERROR,
                collection: TPCollection,
                error
              } as ApprovalFlowModalMetadata)
            )
            .run({ silenceTimeout: true })
        })
      })

      describe('when the review transaction fails', () => {
        it('should open the modal in an error state', () => {
          const consumeSlotsError = 'Error when consuming slots'
          const parsedSignature = ethers.utils.splitSignature(cheque.signature)
          const merkleTree = generateTree(Object.values(contentHashes))
          return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
            .provide([
              [select(getPaginationData, TPCollection.id), { total: totalItems }],
              [
                call([mockBuilder, 'fetchApprovalData'], TPCollection.id),
                { cheque, content_hashes: contentHashes, root: defaultMerkleRoot }
              ]
            ])
            .dispatch(initiateTPApprovalFlow(TPCollection))
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
            .dispatch(reviewThirdPartyFailure(consumeSlotsError))
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
          return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
            .provide([
              [select(getPaginationData, TPCollection.id), { total: totalItems }],
              [
                call([mockBuilder, 'fetchApprovalData'], TPCollection.id),
                { cheque, content_hashes: contentHashes, root: defaultMerkleRoot }
              ],
              [select(getItemsById), { [syncedItem.id]: syncedItem, [updatedItem.id]: updatedItem }],
              [call([mockBuilderClient, 'getThirdParty'], extractThirdPartyId(TPCollection.urn)), { root: merkleTree.merkleRoot }]
            ])
            .dispatch(initiateTPApprovalFlow(TPCollection))
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
            .dispatch(reviewThirdPartySuccess())
            .put(
              openModal('ApprovalFlowModal', {
                view: ApprovalFlowModalView.DEPLOY_TP,
                collection: TPCollection,
                items: itemsToApprove,
                tree: merkleTree,
                hashes: contentHashes
              } as ApprovalFlowModalMetadata)
            )
            .dispatch(deployBatchedThirdPartyItemsFailure([], deployError))
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

  describe('when the collection has already been approved', () => {
    beforeEach(() => {
      itemsToApprove = [syncedItem, unsyncedItem]
      itemCurations = itemsToApprove.map(item => getItemCurationMock(item))
      ;(mockBuilder.fetchCollectionItems as jest.Mock).mockResolvedValue({ results: itemsToApprove })
    })

    describe('and the merkle root in the blockchain is the same as the computed one', () => {
      it('should omit the procedure to approve the items in the blockchain', () => {
        const merkleTree = generateTree(Object.values(contentHashes))
        const parsedSignature = ethers.utils.splitSignature(cheque.signature)

        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getPaginationData, TPCollection.id), { total: 40 }],
            [
              call([mockBuilder, 'fetchApprovalData'], TPCollection.id),
              { cheque, content_hashes: contentHashes, root: merkleTree.merkleRoot }
            ]
          ])
          .dispatch(initiateTPApprovalFlow(TPCollection))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.LOADING,
              collection: TPCollection
            } as ApprovalFlowModalMetadata)
          )
          .not.put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.CONSUME_TP_SLOTS,
              items: itemsToApprove,
              collection: TPCollection,
              merkleTreeRoot: merkleTree.merkleRoot,
              slots: [{ qty: cheque.qty, salt: cheque.salt, sigR: parsedSignature.r, sigS: parsedSignature.s, sigV: parsedSignature.v }]
            } as ApprovalFlowModalMetadata<ApprovalFlowModalView.CONSUME_TP_SLOTS>)
          )
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.DEPLOY_TP,
              collection: TPCollection,
              items: itemsToApprove,
              tree: merkleTree,
              hashes: contentHashes
            } as ApprovalFlowModalMetadata)
          )
          .dispatch(deployBatchedThirdPartyItemsSuccess(TPCollection, itemCurations))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.SUCCESS,
              collection: TPCollection
            })
          )
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when handling the save of multiple items', () => {
  let collection: Collection
  let items: Item[]
  let fileNames: string[]

  beforeEach(() => {
    collection = getTPCollectionMock({ isPublished: false })
  })

  describe('and there were no items saved', () => {
    beforeEach(() => {
      items = []
      fileNames = []
    })

    it('should not put the collection save action', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .not.put(saveCollectionRequest(collection))
        .dispatch(saveMultipleItemsSuccess(items, fileNames, []))
        .run({ silenceTimeout: true })
    })
  })

  describe('and there were at least one item saved', () => {
    beforeEach(() => {
      items = [{ id: 'item1', collectionId: collection.id } as Item]
      fileNames = ['file1']
    })

    it('should put a collection save action', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([[select(getCollection, items[0].collectionId!), collection]])
        .put(saveCollectionRequest(collection))
        .dispatch(saveMultipleItemsSuccess(items, fileNames, []))
        .run({ silenceTimeout: true })
    })
  })
})

describe('when handling the fetch of collections', () => {
  let collection: Collection

  describe('and pagination parameters are sent', () => {
    let mockedPaginationData: PaginationStats
    let mockedFetchParameters: FetchCollectionsParams
    beforeEach(() => {
      mockedPaginationData = getPaginationDataMock()
      collection = getCollectionMock()
      mockedFetchParameters = {
        assignee: '0x123',
        isPublished: true,
        limit: 1,
        page: 1,
        q: collection.name,
        sort: CurationSortOptions.NAME_ASC,
        status: CurationStatus.TO_REVIEW
      }
    })

    it('should put the success action with the pagination information from the response', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getWalletItems), []],
          [call([mockBuilder, 'fetchCollections'], undefined, mockedFetchParameters), { ...mockedPaginationData, results: [collection] }]
        ])
        .put(fetchCollectionsSuccess([collection], mockedPaginationData, mockedFetchParameters))
        .dispatch(fetchCollectionsRequest(undefined, mockedFetchParameters))
        .run({ silenceTimeout: true })
    })
  })

  describe('and pagination params are not sent', () => {
    let mockedFetchParameters: FetchCollectionsParams
    beforeEach(() => {
      collection = getCollectionMock()
      mockedFetchParameters = {
        assignee: '0x123',
        isPublished: true,
        q: collection.name,
        sort: CurationSortOptions.NAME_ASC,
        status: CurationStatus.TO_REVIEW
      }
    })

    it('should put the success action with the data without pagination information', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getWalletItems), []],
          [call([mockBuilder, 'fetchCollections'], undefined, mockedFetchParameters), [collection]]
        ])
        .put(fetchCollectionsSuccess([collection], undefined, mockedFetchParameters))
        .dispatch(fetchCollectionsRequest(undefined, mockedFetchParameters))
        .run({ silenceTimeout: true })
    })
  })

  describe('and tag filter is sent', () => {
    let mockedFetchParameters: FetchCollectionsParams
    beforeEach(() => {
      collection = getCollectionMock()
      mockedFetchParameters = {
        tag: ['TAG']
      }
    })
    it('should put the success action with the collections filtered by item tag', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getWalletItems), []],
          [call([mockBuilder, 'fetchCollections'], undefined, mockedFetchParameters), [collection]]
        ])
        .put(fetchCollectionsSuccess([collection], undefined, mockedFetchParameters))
        .dispatch(fetchCollectionsRequest(undefined, mockedFetchParameters))
        .run({ silenceTimeout: true })
    })
  })

  describe('and should use the already fetched version', () => {
    let mockedFetchParameters: FetchCollectionsParams
    let alreadyFetchedCollections: Record<string, Collection>
    beforeEach(() => {
      collection = getCollectionMock()
      mockedFetchParameters = {
        assignee: '0x123',
        isPublished: true,
        q: collection.name,
        sort: CurationSortOptions.NAME_ASC,
        status: CurationStatus.TO_REVIEW
      }
      alreadyFetchedCollections = {
        [collection.id]: collection
      }
    })

    describe('and it has pagination information', () => {
      let paginationData: CollectionPaginationData
      let paginationStats: PaginationStats
      beforeEach(() => {
        paginationData = {
          currentPage: 1,
          ids: [],
          limit: 1,
          total: 1,
          totalPages: 1
        }
        paginationStats = {
          limit: 1,
          page: 1,
          pages: 1,
          total: 1
        }
      })
      it('should put the success action with the data without pagination information', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getWalletItems), []],
            [select(getLastFetchParams), mockedFetchParameters],
            [select(getData), alreadyFetchedCollections],
            [select(getCollectionPaginationData), paginationData]
          ])
          .put(fetchCollectionsSuccess([collection], paginationStats, mockedFetchParameters))
          .dispatch(fetchCollectionsRequest(undefined, mockedFetchParameters, true))
          .run({ silenceTimeout: true })
      })
    })

    describe('and it does not have pagination information', () => {
      it('should put the success action with the data without pagination information', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getWalletItems), []],
            [select(getLastFetchParams), mockedFetchParameters],
            [select(getData), alreadyFetchedCollections],
            [select(getCollectionPaginationData), undefined]
          ])
          .put(fetchCollectionsSuccess([collection], undefined, mockedFetchParameters))
          .dispatch(fetchCollectionsRequest(undefined, mockedFetchParameters, true))
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when handling the fetch of a collection', () => {
  let collection: Collection

  describe('and the collection is published but the server items does not have a tokenId', () => {
    let items: Item[]
    let address: string

    beforeEach(() => {
      address = '0xa'
      collection = { id: 'someId', owner: address, isPublished: true, forumLink: 'someLink' } as Collection
      items = [{ id: 'item-id', tokenId: undefined }] as Item[]
    })

    it('should put the setItemsTokenIdRequest action with the collection items', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getCollection, collection.id), collection],
          [select(getName), null],
          [select(getAddress), address],
          [select(getCollectionItems, collection.id), items]
        ])
        .put(setItemsTokenIdRequest(collection, items))
        .dispatch(
          fetchCollectionItemsSuccess(collection.id, items, {
            limit: 5000,
            page: 1,
            pages: 1,
            total: 1
          })
        )
        .run({ silenceTimeout: true })
    })
  })
})

describe('when publishing a collection with fiat', () => {
  let subscribeToNewsletter: boolean
  let collection: Collection
  let items: Item[]
  let serverItems: Item[]
  let email: string
  let paymentMethod: PaymentMethod
  let wertEnv: string
  let from: string
  let rarities: BlockchainRarity[]

  beforeEach(() => {
    email = ''
    collection = {
      name: 'name'
    } as Collection
    from = '0x' + '123'.padStart(40, '0')
  })

  describe('when subscribe to newsletter is false', () => {
    beforeEach(() => {
      subscribeToNewsletter = false
    })

    describe('when collection is not locked', () => {
      beforeEach(() => {
        collection.isPublished = false
        collection.lock = new Date(new Date().setDate(new Date().getDate() + 1)).getTime() // Tomorrow
      })

      describe('when collection has salt', () => {
        beforeEach(() => {
          collection.salt = '0x' + '123'.padStart(64, '0')
        })

        describe('when no items are provided', () => {
          beforeEach(() => {
            items = []
          })

          describe('when the collection has the same amount of items in the server as locally', () => {
            beforeEach(() => {
              serverItems = []
            })

            describe('when the payment method is fiat', () => {
              beforeEach(() => {
                paymentMethod = PaymentMethod.FIAT
              })

              describe('when the wert env is not defined', () => {
                beforeEach(() => {
                  wertEnv = ''
                })

                it('should dispatch a failure action', () => {
                  return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
                    .provide([
                      [call([mockBuilder, 'fetchCollectionItems'], collection.id), serverItems],
                      [select(getAddress), 'address'],
                      [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
                      [retry(10, 500, mockBuilder.saveTOS, TermsOfServiceEvent.PUBLISH_COLLECTION, collection, email), undefined],
                      [call([config, config.get], 'WERT_PUBLISH_FEES_ENV'), wertEnv]
                    ])
                    .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, paymentMethod))
                    .put(publishCollectionFailure(collection, items, 'Missing WERT_PUBLISH_FEES_ENV', true))
                    .silentRun()
                })
              })

              describe('when the wert env is defined but is not valid', () => {
                beforeEach(() => {
                  wertEnv = 'invalid'
                })

                it('should dispatch a failure action', () => {
                  return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
                    .provide([
                      [call([mockBuilder, 'fetchCollectionItems'], collection.id), serverItems],
                      [select(getAddress), 'address'],
                      [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
                      [retry(10, 500, mockBuilder.saveTOS, TermsOfServiceEvent.PUBLISH_COLLECTION, collection, email), undefined],
                      [call([config, config.get], 'WERT_PUBLISH_FEES_ENV'), wertEnv]
                    ])
                    .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, paymentMethod))
                    .put(publishCollectionFailure(collection, items, 'Invalid WERT_PUBLISH_FEES_ENV', true))
                    .silentRun()
                })
              })

              describe('when the wert env is defined and is valid', () => {
                beforeEach(() => {
                  wertEnv = 'dev'
                })

                describe('when fetching rarities fails', () => {
                  it('should dispatch a failure action', () => {
                    return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
                      .provide([
                        [call([mockBuilder, 'fetchCollectionItems'], collection.id), serverItems],
                        [select(getAddress), from],
                        [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
                        [retry(10, 500, mockBuilder.saveTOS, TermsOfServiceEvent.PUBLISH_COLLECTION, collection, email), undefined],
                        [call([config, config.get], 'WERT_PUBLISH_FEES_ENV'), wertEnv],
                        [put(fetchRaritiesRequest()), undefined],
                        [
                          race({ success: take(FETCH_RARITIES_SUCCESS), failure: take(FETCH_RARITIES_FAILURE) }),
                          { failure: { payload: { error: 'error' } } as FetchRaritiesFailureAction }
                        ]
                      ])
                      .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, paymentMethod))
                      .put(publishCollectionFailure(collection, items, 'Could not fetch rarities: error', true))
                      .silentRun()
                  })
                })

                describe('when fetching rarities succeeds', () => {
                  describe('when there are no rarities', () => {
                    beforeEach(() => {
                      rarities = []
                    })

                    it('should dispatch a failure action', () => {
                      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
                        .provide([
                          [call([mockBuilder, 'fetchCollectionItems'], collection.id), serverItems],
                          [select(getAddress), from],
                          [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
                          [retry(10, 500, mockBuilder.saveTOS, TermsOfServiceEvent.PUBLISH_COLLECTION, collection, email), undefined],
                          [call([config, config.get], 'WERT_PUBLISH_FEES_ENV'), wertEnv],
                          [put(fetchRaritiesRequest()), undefined],
                          [
                            race({ success: take(FETCH_RARITIES_SUCCESS), failure: take(FETCH_RARITIES_FAILURE) }),
                            { success: { payload: { rarities } } as FetchRaritiesSuccessAction }
                          ]
                        ])
                        .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, paymentMethod))
                        .put(publishCollectionFailure(collection, items, 'Rarity not found', true))
                        .silentRun()
                    })
                  })

                  describe('when there is a rarity', () => {
                    describe('when that rarity does no have prices', () => {
                      beforeEach(() => {
                        rarities = [{} as BlockchainRarity]
                      })

                      it('should dispatch a failure action', () => {
                        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
                          .provide([
                            [call([mockBuilder, 'fetchCollectionItems'], collection.id), serverItems],
                            [select(getAddress), from],
                            [call(getChainIdByNetwork, Network.MATIC), ChainId.MATIC_MUMBAI],
                            [retry(10, 500, mockBuilder.saveTOS, TermsOfServiceEvent.PUBLISH_COLLECTION, collection, email), undefined],
                            [call([config, config.get], 'WERT_PUBLISH_FEES_ENV'), wertEnv],
                            [put(fetchRaritiesRequest()), undefined],
                            [
                              race({ success: take(FETCH_RARITIES_SUCCESS), failure: take(FETCH_RARITIES_FAILURE) }),
                              { success: { payload: { rarities } } as FetchRaritiesSuccessAction }
                            ]
                          ])
                          .dispatch(publishCollectionRequest(collection, items, email, subscribeToNewsletter, paymentMethod))
                          .put(publishCollectionFailure(collection, items, 'Rarity prices not found', true))
                          .silentRun()
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})

describe('when handling the successful save of an item', () => {
  let item: Item
  beforeEach(() => {
    item = { id: 'item-id' } as Item
  })

  describe('and the item has a collection', () => {
    beforeEach(() => {
      item = { ...item, collectionId: 'aCollectionId' } as Item
    })

    describe('and the item is published', () => {
      beforeEach(() => {
        item = { ...item, isPublished: true }
      })

      it('should not put any action', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .dispatch(saveItemSuccess(item, {}))
          .run({ silenceTimeout: true })
          .then(({ effects }) => {
            expect(effects.put).toBeUndefined()
          })
      })
    })

    describe('and the item is not published', () => {
      beforeEach(() => {
        item = { ...item, isPublished: false }
      })

      describe('and the onlySavedItem option is set', () => {
        it('should not put any action', () => {
          return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
            .dispatch(saveItemSuccess(item, {}, { onlySaveItem: true }))
            .run({ silenceTimeout: true })
            .then(({ effects }) => {
              expect(effects.put).toBeUndefined()
            })
        })
      })

      describe('and the onlySavedItem option is not set', () => {
        let collection: Collection

        beforeEach(() => {
          collection = { id: item.collectionId } as Collection
        })

        it('should put a saveCollectionRequest action', () => {
          return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
            .provide([[select(getCollection, item.collectionId ?? ''), collection]])
            .dispatch(saveItemSuccess(item, {}))
            .put(saveCollectionRequest(collection))
            .run({ silenceTimeout: true })
        })
      })
    })
  })

  describe('and the item does not have a collection', () => {
    beforeEach(() => {
      item = { ...item, collectionId: undefined } as Item
    })

    it('should not put any action', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .dispatch(saveItemSuccess(item, {}))
        .run({ silenceTimeout: true })
        .then(({ effects }) => {
          expect(effects.put).toBeUndefined()
        })
    })
  })
})

describe('when handling a deploy missing entities', () => {
  let collection: Collection
  let items: Item[]
  let deployData: DeploymentPreparationData

  beforeEach(() => {
    collection = getCollectionMock()
    items = [
      getItemMock(collection, {
        id: 'anItem',
        currentContentHash: 'QmNewContentHash',
        blockchainContentHash: 'QmOldContentHash'
      })
    ]
    deployData = getDeployDataMock()
  })

  describe('and there are items to upload', () => {
    describe('and the upload succeeds', () => {
      it('should dispatch openModal DeployEntitiesModal with a success view', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getItems), items],
            [select(getEntityByItemId), {}],
            [call(buildItemEntity, mockBuilder, collection, items[0], undefined, undefined), deployData]
          ])
          .dispatch(deployMissingEntitiesRequest(collection))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.DEPLOY,
              collection,
              items,
              entities: [deployData]
            } as ApprovalFlowModalMetadata<ApprovalFlowModalView.DEPLOY>)
          )
          .dispatch(deployEntitiesSuccess([deployData]))
          .put(closeModal('ApprovalFlowModal'))
          .put(deployMissingEntitiesSuccess())
          .put(fetchCollectionItemsRequest(collection.id))
          .put(
            openModal('DeployEntitiesModal', {
              view: 'success',
              collection
            })
          )
          .run({ silenceTimeout: true })
      })
    })

    describe('and the upload fails', () => {
      const deployError = 'Deployment failed'

      it('should dispatch openModal DeployEntitiesModal with an error view', () => {
        return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
          .provide([
            [select(getItems), items],
            [select(getEntityByItemId), {}],
            [call(buildItemEntity, mockBuilder, collection, items[0], undefined, undefined), deployData]
          ])
          .dispatch(deployMissingEntitiesRequest(collection))
          .put(
            openModal('ApprovalFlowModal', {
              view: ApprovalFlowModalView.DEPLOY,
              collection,
              items,
              entities: [deployData]
            } as ApprovalFlowModalMetadata<ApprovalFlowModalView.DEPLOY>)
          )
          .dispatch(deployEntitiesFailure([deployData], deployError))
          .put(closeModal('ApprovalFlowModal'))
          .put(deployMissingEntitiesFailure(deployError))
          .put(
            openModal('DeployEntitiesModal', {
              view: 'error',
              collection,
              error: deployError
            })
          )
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('and there are no items to upload', () => {
    it('should end the flow without showing any modal', () => {
      return expectSaga(collectionSaga, mockBuilder, mockBuilderClient)
        .provide([
          [select(getItems), []],
          [select(getEntityByItemId), {}]
        ])
        .dispatch(deployMissingEntitiesRequest(collection))
        .not.put(openModal('ApprovalFlowModal', expect.any(Object)))
        .not.put(closeModal('ApprovalFlowModal'))
        .not.put(fetchCollectionItemsRequest(collection.id))
        .not.put(openModal('DeployEntitiesModal', expect.any(Object)))
        .put(deployMissingEntitiesSuccess())
        .run({ silenceTimeout: true })
    })
  })
})
