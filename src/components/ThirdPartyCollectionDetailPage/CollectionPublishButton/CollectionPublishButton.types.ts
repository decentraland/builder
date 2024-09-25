import { Dispatch } from 'redux'
import { OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'

export enum PublishButtonAction {
  NONE,
  PUBLISH,
  PUSH_CHANGES,
  PUBLISH_AND_PUSH_CHANGES
}

export type Props = {
  collection: Collection
  items: Item[]
  itemCurations: ItemCuration[]
  isLoadingItemCurations: boolean
  isLinkedWearablesPaymentsEnabled: boolean
  itemsStatus: Record<string, SyncStatus>
  slots: number
  onClick: (collectionId: string, itemIds: string[], action: PublishButtonAction) => void
  onNewClick: (collectionId: string, itemsWithChanges: Item[], itemsToPublish: Item[]) => void
}

export type OwnProps = Pick<Props, 'items' | 'collection'>
export type MapStateProps = Pick<Props, 'itemCurations' | 'itemsStatus' | 'isLoadingItemCurations' | 'isLinkedWearablesPaymentsEnabled'>
export type MapDispatchProps = Pick<Props, 'onClick' | 'onNewClick'>
export type MapDispatch = Dispatch<OpenModalAction>
