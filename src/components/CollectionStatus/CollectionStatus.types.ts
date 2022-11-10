import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { SyncStatus } from 'modules/item/types'

export type Props = {
  collection: Collection
  status: SyncStatus
}

export type MapStateProps = Pick<Props, 'status'>
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'collection'>
