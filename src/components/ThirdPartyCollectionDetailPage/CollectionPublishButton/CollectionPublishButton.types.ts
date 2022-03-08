import { Dispatch } from 'redux'
import { OpenModalAction } from 'modules/modal/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'

export enum PublishButtonAction {
  PUBLISH,
  PUSH_CHANGES,
  PUBLISH_AND_PUSH_CHANGES
}

export type Props = {
  collection: Collection
  items: Item[]
  itemCurations: ItemCuration[]
  isLoadingItemCurations: boolean
  itemsStatus: Record<string, SyncStatus>
  slots: number
  onClick: (collectionId: string, itemIds: string[], action: PublishButtonAction) => void
}

export type OwnProps = Pick<Props, 'items' | 'collection'>
export type MapStateProps = Pick<Props, 'itemCurations' | 'itemsStatus' | 'isLoadingItemCurations'>
export type MapDispatchProps = Pick<Props, 'onClick'>
export type MapDispatch = Dispatch<OpenModalAction>
