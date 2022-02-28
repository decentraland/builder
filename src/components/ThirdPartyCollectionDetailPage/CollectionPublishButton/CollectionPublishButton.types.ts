import { Dispatch } from 'redux'
import { OpenModalAction } from 'modules/modal/actions'
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
  itemsStatus: Record<string, SyncStatus>
  slots: number
  onClick: (collectionId: string, itemIds: string[], action: PublishButtonAction) => void
}

export type OwnProps = Pick<Props, 'items'>
export type MapStateProps = Pick<Props, 'itemsStatus'>
export type MapDispatchProps = Pick<Props, 'onClick'>
export type MapDispatch = Dispatch<OpenModalAction>
