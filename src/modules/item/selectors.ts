import { Entity } from '@dcl/schemas'
import { AnyAction } from 'redux-saga'
import { createSelector } from 'reselect'
import { getSearch } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { Collection } from 'modules/collection/types'
import { getAuthorizedCollections, getData as getCollectionData } from 'modules/collection/selectors'
import { getEntities, getMissingEntities } from 'modules/entity/selectors'
import { EntityState } from 'modules/entity/reducer'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { getCurationsByCollectionId } from 'modules/curations/collectionCuration/selectors'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { getItemCurationsByItemId } from 'modules/curations/itemCuration/selectors'
import { CurationStatus } from 'modules/curations/types'
import { getItemThirdParty } from 'modules/thirdParty/selectors'
import { isUserManagerOfThirdParty } from 'modules/thirdParty/utils'
import { isEqual } from 'lib/address'
import { buildCatalystItemURN, isThirdParty } from '../../lib/urn'
import { DOWNLOAD_ITEM_REQUEST, SAVE_ITEM_REQUEST, SaveItemRequestAction } from './actions'
import { ItemState } from './reducer'
import { Item, SyncStatus, BlockchainRarity, CatalystItem, VIDEO_PATH } from './types'
import { areSynced, canSeeItem, isEmote, isOwner, isSmart, isWearable } from './utils'

export const getState = (state: RootState) => state.item
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getPaginationData = (state: RootState, collectionId: string) => getState(state).pagination?.[collectionId]
export const getError = (state: RootState) => getState(state).error
const isSavingItemAction = (action: AnyAction): action is SaveItemRequestAction => action.type === SAVE_ITEM_REQUEST

export const getItems = createSelector<RootState, ItemState['data'], Item[]>(getData, itemData => Object.values(itemData))

export const getItem = (state: RootState, itemId: string) => {
  const items = getItems(state)
  return items.find(item => item.id === itemId) || null
}

export const hasUserOrphanItems = (state: RootState): boolean | undefined => getState(state).hasUserOrphanItems

export const getWalletItems = createSelector<RootState, Item[], string | undefined, Item[]>(getItems, getAddress, (items, address) =>
  items.filter(item => address && isEqual(item.owner, address))
)

export const getAuthorizedItems = createSelector<RootState, Collection[], Item[], string | undefined, Item[]>(
  state => getAuthorizedCollections(state),
  state => getItems(state),
  state => getAddress(state),
  (collections, items, address) => {
    if (!address) {
      return []
    }

    return items.filter(item => {
      const collection = collections.filter(collection => collection.id === item.collectionId)[0]
      return canSeeItem(collection, item, address)
    })
  }
)

export const getWalletOrphanItems = createSelector<RootState, Item[], Item[]>(getAuthorizedItems, items =>
  items.filter(item => item.collectionId === undefined)
)

export const getPaginatedWalletOrphanItems = (state: RootState, address: string, pageSize?: number) => {
  const paginationData = getPaginationData(state, address)
  const allItems = getData(state)
  const ids = paginationData ? (pageSize ? paginationData.ids.slice(0, pageSize) : paginationData.ids) : []
  return ids.map(itemId => allItems[itemId]).filter(Boolean)
}

export const getCollectionItems = (state: RootState, collectionId: string) => {
  const allItems = getItems(state)
  return allItems.filter(item => item.collectionId === collectionId)
}

export const getPaginatedCollectionItems = (state: RootState, collectionId: string, pageSize?: number) => {
  const paginationData = getPaginationData(state, collectionId)
  const allItems = getData(state)
  const ids = paginationData ? (pageSize ? paginationData.ids.slice(0, pageSize) : paginationData.ids) : []
  return ids.map(itemId => allItems[itemId]).filter(Boolean)
}

export const getRarities = (state: RootState): BlockchainRarity[] => {
  return getState(state).rarities
}

export const getWearables = createSelector<RootState, Item[], Item[]>(getItems, items => items.filter(isWearable))

export const getEmotes = createSelector<RootState, Item[], Item[]>(getItems, items => items.filter(isEmote))

export const getItemsByURN = createSelector<RootState, Item[], Record<string, Collection>, Record<string, Item>>(
  state => getItems(state),
  state => getCollectionData(state),
  (items, collectionsById) => {
    const itemsByURN: Record<string, Item> = {}
    for (const item of items.filter(item => item.isPublished)) {
      const collection = collectionsById[item.collectionId!]
      if (collection) {
        const urn = buildCatalystItemURN(collection.contractAddress!, item.tokenId!)
        itemsByURN[urn] = item
      }
    }
    return itemsByURN
  }
)

export const getEntityByItemId = createSelector<RootState, Entity[], Record<string, Item>, Record<string, Entity>>(
  getEntities,
  getItemsByURN,
  (entities, itemsByURN) =>
    entities.reduce((obj, entity) => {
      const urn: string = (entity.metadata as CatalystItem).id
      const item = itemsByURN[urn]
      if (item) {
        obj[item.id] = entity
      }
      return obj
    }, {} as Record<string, Entity>)
)

const getStatusForTP = (item: Item, itemCuration: ItemCuration | null): SyncStatus => {
  if (!item.isPublished && !itemCuration) {
    return SyncStatus.UNPUBLISHED
  } else if (itemCuration && itemCuration.status === CurationStatus.PENDING) {
    return SyncStatus.UNDER_REVIEW
  } else if (itemCuration && itemCuration.status === CurationStatus.APPROVED) {
    // Validate after the item is updated if it is a smart wearable it contains an uploaded video.
    const smartWearableHasUpdatedVideo = isSmart(item) && item.contents[VIDEO_PATH] !== item.video
    // Blockchain content hash contains the hash in the catalyst for TP items
    return item.currentContentHash !== item.catalystContentHash || smartWearableHasUpdatedVideo ? SyncStatus.UNSYNCED : SyncStatus.SYNCED
  }
  return SyncStatus.UNPUBLISHED
}

const getStatusForStandard = (
  item: Item,
  collectionCuration: CollectionCuration | null,
  entity: Entity,
  isMissingEntity: boolean
): SyncStatus => {
  let status: SyncStatus
  if (entity) {
    if (areSynced(item, entity)) {
      status = SyncStatus.SYNCED
    } else {
      if (collectionCuration?.status === CurationStatus.PENDING) {
        status = SyncStatus.UNDER_REVIEW
      } else {
        status = SyncStatus.UNSYNCED
      }
    }
  } else {
    if (!item.isPublished) {
      status = SyncStatus.UNPUBLISHED
    } else if (!item.isApproved) {
      status = SyncStatus.UNDER_REVIEW
    } else if (isMissingEntity) {
      // Item is published and approved but has missing entities
      status = SyncStatus.UNSYNCED
    } else {
      status = SyncStatus.LOADING
    }
  }
  return status
}

export const getStatusByItemId = createSelector<
  RootState,
  Item[],
  EntityState['data'],
  Record<string, CollectionCuration>,
  Record<string, ItemCuration>,
  Record<string, string[]>,
  Record<string, SyncStatus>
>(
  getItems,
  getEntityByItemId,
  getCurationsByCollectionId,
  getItemCurationsByItemId,
  state => getMissingEntities(state),
  (items, entitiesByItemId, curationsByCollectionId, itemCurationByItemId, missingEntities) => {
    const statusByItemId: Record<string, SyncStatus> = {}
    for (const item of items) {
      // Check if this item has a missing entity by checking if its URN is in any of the missingEntities lists
      const isMissingEntity = !!item.urn && Object.values(missingEntities).some(pointers => pointers.includes(item.urn!))

      statusByItemId[item.id] = isThirdParty(item.urn)
        ? getStatusForTP(item, itemCurationByItemId[item.id])
        : getStatusForStandard(
            item,
            item.collectionId ? curationsByCollectionId[item.collectionId] : null,
            entitiesByItemId[item.id],
            isMissingEntity
          )
    }
    return statusByItemId
  }
)

export const getStatusForItemIds = createSelector<
  RootState,
  Item['id'][],
  Item['id'][],
  Record<string, SyncStatus>,
  Record<string, SyncStatus>
>(
  (_state: RootState, itemIds: Item['id'][]) => itemIds,
  getStatusByItemId,
  (itemIds, statusByItemId) => {
    return itemIds.reduce((acc, currItemId) => {
      acc[currItemId] = statusByItemId[currItemId]
      return acc
    }, {} as Record<string, SyncStatus>)
  }
)

export const isDownloading = (state: RootState) => isLoadingType(getLoading(state), DOWNLOAD_ITEM_REQUEST)

export const hasViewAndEditRights = (state: RootState, address: string, collection: Collection | null, item: Item): boolean => {
  const thirdPartyItem = isThirdParty(item.urn) ? getItemThirdParty(state, item) : null

  return (
    (thirdPartyItem !== null && isUserManagerOfThirdParty(address, thirdPartyItem)) ||
    (collection !== null ? canSeeItem(collection, item, address) : isOwner(item, address))
  )
}

export const getNewItemName = (state: RootState) => new URLSearchParams(getSearch(state)).get('newItem')

export const getIdsOfItemsBeingSaved = createSelector<RootState, AnyAction[], Record<string, boolean>>(getLoading, (actions: AnyAction[]) =>
  actions.reduce((acc, action) => {
    if (isSavingItemAction(action)) {
      acc[action.payload.item.id] = true
    }
    return acc
  }, {} as Record<string, boolean>)
)

export const getUnpublishedThirdPartyItemsById = (state: RootState, itemIds: string[]): Item[] => {
  const statusOfItems = getStatusForItemIds(state, itemIds)
  return itemIds
    .filter(itemId => statusOfItems[itemId] === SyncStatus.UNPUBLISHED)
    .map(itemId => getItem(state, itemId))
    .filter(Boolean) as Item[]
}

export const getUnsyncedThirdPartyItemsById = (state: RootState, itemIds: string[]): Item[] => {
  const statusOfItems = getStatusForItemIds(state, itemIds)
  return itemIds
    .filter(itemId => statusOfItems[itemId] === SyncStatus.UNSYNCED)
    .map(itemId => getItem(state, itemId))
    .filter(Boolean) as Item[]
}
