import { Entity } from 'dcl-catalyst-commons'
import { createSelector } from 'reselect'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { Collection } from 'modules/collection/types'
import { getAuthorizedCollections, getData as getCollectionData } from 'modules/collection/selectors'
import { getEntities } from 'modules/entity/selectors'
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
import { DOWNLOAD_ITEM_REQUEST } from './actions'
import { ItemState } from './reducer'
import { Item, SyncStatus, Rarity, CatalystItem } from './types'
import { areSynced, canSeeItem, isOwner } from './utils'

export const getState = (state: RootState) => state.item
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const getItems = createSelector<RootState, ItemState['data'], Item[]>(getData, itemData => Object.values(itemData))

export const getItem = (state: RootState, itemId: string) => {
  const items = getItems(state)
  return items.find(item => item.id === itemId) || null
}

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

export const getCollectionItems = (state: RootState, collectionId: string) => {
  const allItems = getItems(state)
  return allItems.filter(item => item.collectionId === collectionId)
}

export const getRarities = (state: RootState): Rarity[] => {
  return getState(state).rarities
}

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
  state => getEntities(state),
  state => getItemsByURN(state),
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

const getItemSyncedStatus = (item: Item, entity: Entity | null) => {
  let status = SyncStatus.UNSYNCED
  if (!entity) {
    status = SyncStatus.LOADING
  } else if (areSynced(item, entity)) {
    status = SyncStatus.SYNCED
  }
  return status
}

const getStatusForTP = (item: Item, itemCuration: ItemCuration | null, entity: Entity): SyncStatus => {
  let status: SyncStatus
  if (!itemCuration) {
    status = SyncStatus.UNPUBLISHED
  } else if (itemCuration.status === CurationStatus.PENDING) {
    return SyncStatus.UNDER_REVIEW
  } else {
    status = getItemSyncedStatus(item, entity)
  }
  return status
}

const getStatusForDCL = (item: Item, collectionCuration: CollectionCuration | null, entity: Entity): SyncStatus => {
  let status: SyncStatus
  if (!item.isPublished) {
    status = SyncStatus.UNPUBLISHED
  } else if (!item.isApproved || (collectionCuration && collectionCuration.status === CurationStatus.PENDING)) {
    status = SyncStatus.UNDER_REVIEW
  } else {
    status = getItemSyncedStatus(item, entity)
  }
  return status
}

export const getStatusByItemId = createSelector<
  RootState,
  Item[],
  EntityState['data'],
  Record<string, CollectionCuration>,
  Record<string, ItemCuration>,
  Record<string, SyncStatus>
>(
  state => getItems(state),
  state => getEntityByItemId(state),
  state => getCurationsByCollectionId(state),
  getItemCurationsByItemId,
  (items, entitiesByItemId, curationsByCollectionId, itemCurationByItemId) => {
    const statusByItemId: Record<string, SyncStatus> = {}
    for (const item of items) {
      statusByItemId[item.id] = isThirdParty(item.urn)
        ? getStatusForTP(item, itemCurationByItemId[item.id], entitiesByItemId[item.id])
        : getStatusForDCL(item, item.collectionId ? curationsByCollectionId[item.collectionId] : null, entitiesByItemId[item.id])
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
  const itemThirdParty = isThirdParty(item.urn) ? getItemThirdParty(state, item) : null

  return (
    (itemThirdParty !== null && isUserManagerOfThirdParty(address, itemThirdParty)) ||
    (collection !== null ? canSeeItem(collection, item, address) : isOwner(item, address))
  )
}
