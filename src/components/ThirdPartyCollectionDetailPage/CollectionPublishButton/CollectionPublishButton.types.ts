import { Dispatch } from 'redux'
import { OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  itemsStatus: Record<string, SyncStatus>
  slots: number
  onPublish: (collectionId: string, itemIds: string[], willPushChanges?: boolean) => void
  onPushChanges: (collectionId: string, itemIds: string[]) => void
}

export type OwnProps = Pick<Props, 'items'>
export type MapStateProps = Pick<Props, 'itemsStatus'>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onPushChanges'>
export type MapDispatch = Dispatch<OpenModalAction>
