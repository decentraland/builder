import { createSelector } from 'reselect'
import { DeploymentWithMetadataContentAndPointers } from 'dcl-catalyst-client'
import { RootState } from 'modules/common/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Collection } from 'modules/collection/types'
import { getAuthorizedCollections, getData as getCollectionData } from 'modules/collection/selectors'
import { getEntities } from 'modules/entity/selectors'
import { EntityState } from 'modules/entity/reducer'
import { isEqual } from 'lib/address'
import { ItemState } from './reducer'
import { Item, SyncStatus, Rarity, CatalystItem } from './types'
import { areSynced, canSeeItem, getCatalystItemURN } from './utils'
import { Curation, CurationStatus } from 'modules/curation/types'
import { getCurationsByCollectionId } from 'modules/curation/selectors'

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
        const urn = getCatalystItemURN(collection.contractAddress!, item.tokenId!)
        itemsByURN[urn] = item
      }
    }
    return itemsByURN
  }
)

export const getEntityByItemId = createSelector<
  RootState,
  DeploymentWithMetadataContentAndPointers[],
  Record<string, Item>,
  Record<string, DeploymentWithMetadataContentAndPointers>
>(
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
    }, {} as Record<string, DeploymentWithMetadataContentAndPointers>)
)

export const getStatusByItemId = createSelector<
  RootState,
  Item[],
  EntityState['data'],
  Record<string, Curation>,
  Record<string, SyncStatus>
>(
  state => getItems(state),
  state => getEntityByItemId(state),
  state => getCurationsByCollectionId(state),
  (items, entitiesByItemId, curationsByCollectionId) => {
    const statusByItemId: Record<string, SyncStatus> = {}
    for (const item of items) {
      if (!item.isPublished) {
        statusByItemId[item.id] = SyncStatus.UNPUBLISHED
      } else if (!item.isApproved) {
        statusByItemId[item.id] = SyncStatus.UNDER_REVIEW
      } else {
        const entity = entitiesByItemId[item.id]
        if (!entity) {
          statusByItemId[item.id] = SyncStatus.LOADING
        } else if (areSynced(item, entity)) {
          statusByItemId[item.id] = SyncStatus.SYNCED
        } else if (item.collectionId && curationsByCollectionId[item.collectionId]?.status === CurationStatus.PENDING) {
          statusByItemId[item.id] = SyncStatus.UNDER_REVIEW
        } else {
          statusByItemId[item.id] = SyncStatus.UNSYNCED
        }
      }
    }
    return statusByItemId
  }
)
