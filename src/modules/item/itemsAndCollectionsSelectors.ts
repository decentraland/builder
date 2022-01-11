import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import { hasViewAndEditRights as hasCollectionViewAndEditRights } from 'modules/collection/selectors'
import { Item } from './types'
import { canSeeItem, isOwner } from './utils'

export const hasViewAndEditRights = (state: RootState, address: string, collection: Collection | null, item: Item | null): boolean =>
  collection
    ? hasCollectionViewAndEditRights(state, address, collection) || (item !== null && canSeeItem(collection, item, address))
    : item !== null && isOwner(item, address)
